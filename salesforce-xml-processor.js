/**
 * Salesforce XML Processor
 * Handles extraction of permission data from Salesforce XML profiles and permission sets
 * and converts the data to CSV format.
 */

const salesforceXmlProcessor = (function() {
  /**
   * Toggle all permission checkboxes based on the Select All checkbox
   */
  function toggleAllPermissions() {
    const selectAll = document.getElementById('selectAll').checked;
    const checkboxes = document.querySelectorAll('.permission-type input[type="checkbox"]:not(#selectAll)');
    checkboxes.forEach(checkbox => {
      checkbox.checked = selectAll;
    });
  }
  
  /**
   * Update the Select All checkbox based on individual checkbox selections
   */
  function updateSelectAll() {
    const checkboxes = document.querySelectorAll('.permission-type input[type="checkbox"]:not(#selectAll)');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    document.getElementById('selectAll').checked = allChecked;
  }
  
  /**
   * Load XML content from a file
   */
  function loadFile() {
    const fileInput = document.getElementById('xmlFile');
    const file = fileInput.files[0];
    
    if (!file) {
      showStatus('Please select a file first.', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('xmlInput').value = e.target.result;
      showStatus('File loaded successfully!', 'success');
    };
    reader.onerror = function() {
      showStatus('Error reading the file.', 'error');
    };
    reader.readAsText(file);
  }
  
  /**
   * Display a status message to the user
   * @param {string} message - The message to display
   * @param {string} type - The type of message ('success' or 'error')
   */
  function showStatus(message, type) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = type;
    statusElement.classList.remove('hidden');
    
    // Hide after a few seconds
    setTimeout(() => {
      statusElement.classList.add('hidden');
    }, 5000);
  }
  
  /**
   * Main function to convert XML to CSV
   */
  function convertToCSV() {
    // Get XML input
    const xmlInput = document.getElementById('xmlInput').value.trim();
    if (!xmlInput) {
      showStatus('Please paste XML content or load a file.', 'error');
      return;
    }
    
    // Get selected permission types
    const selectedPermissions = [];
    document.querySelectorAll('.permission-type input[type="checkbox"]:not(#selectAll)').forEach(checkbox => {
      if (checkbox.checked) {
        selectedPermissions.push(checkbox.id);
      }
    });
    
    if (selectedPermissions.length === 0) {
      showStatus('Please select at least one permission type.', 'error');
      return;
    }
    
    // Process each permission type
    const allResults = {};
    let totalCount = 0;
    
    selectedPermissions.forEach(permType => {
      const { data, count } = extractPermissionData(xmlInput, permType);
      if (count > 0) {
        allResults[permType] = data;
        totalCount += count;
      }
    });
    
    if (totalCount === 0) {
      showStatus('No permissions found in the XML.', 'error');
      return;
    }
    
    // Generate CSV files and download links
    const downloadLinksElement = document.getElementById('downloadLinks');
    downloadLinksElement.innerHTML = '';
    
    // Add individual CSV download links
    Object.keys(allResults).forEach(permType => {
      const data = allResults[permType];
      if (data.length > 0) {
        const csv = convertArrayToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${permType}.csv`;
        link.textContent = `Download ${permType} (${data.length} entries)`;
        downloadLinksElement.appendChild(link);
      }
    });
    
    // Add combined CSV if multiple types
    if (Object.keys(allResults).length > 1) {
      // Combine all data with a type column
      const combinedData = [];
      Object.keys(allResults).forEach(permType => {
        allResults[permType].forEach(item => {
          combinedData.push({
            PermissionType: permType,
            ...item
          });
        });
      });
      
      const combinedCsv = convertArrayToCSV(combinedData);
      const blob = new Blob([combinedCsv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'all_permissions.csv';
      link.textContent = `Download ALL permissions (${combinedData.length} entries)`;
      link.style.fontWeight = 'bold';
      downloadLinksElement.appendChild(link);
      
      // Show preview of the CSV
      const previewSection = document.getElementById('previewSection');
      const csvPreview = document.getElementById('csvPreview');
      const previewLines = combinedCsv.split('\n').slice(0, Math.min(10, combinedData.length + 1)).join('\n');
      csvPreview.textContent = previewLines + (combinedData.length > 10 ? '\n...' : '');
      previewSection.classList.remove('hidden');
    }
    
    downloadLinksElement.classList.remove('hidden');
    showStatus(`Successfully extracted ${totalCount} permissions!`, 'success');
  }
  
  /**
   * Extract permission data from XML content
   * @param {string} xml - The XML content to process
   * @param {string} permissionType - The type of permission to extract
   * @returns {Object} - Object containing the extracted data and count
   */
  function extractPermissionData(xml, permissionType) {
    const results = [];
    
    // Regular expression to match permission blocks
    const regex = new RegExp(`<${permissionType}>([\\s\\S]*?)<\\/${permissionType}>`, 'g');
    
    // Process each match
    let match;
    let count = 0;
    
    while ((match = regex.exec(xml)) !== null) {
      count++;
      const permissionBlock = match[1].trim();
      
      // Extract data based on permission type
      let permData = {};
      
      switch (permissionType) {
        case 'userPermissions':
          permData = {
            Name: extractSimpleTag(permissionBlock, 'name'),
            Enabled: extractSimpleTag(permissionBlock, 'enabled')
          };
          break;
          
        case 'applicationVisibilities':
          permData = {
            Application: extractSimpleTag(permissionBlock, 'application'),
            Default: extractSimpleTag(permissionBlock, 'default'),
            Visible: extractSimpleTag(permissionBlock, 'visible')
          };
          break;
          
        case 'classAccesses':
          permData = {
            ApexClass: extractSimpleTag(permissionBlock, 'apexClass'),
            Enabled: extractSimpleTag(permissionBlock, 'enabled')
          };
          break;
          
        case 'fieldPermissions':
          permData = {
            Field: extractSimpleTag(permissionBlock, 'field'),
            Editable: extractSimpleTag(permissionBlock, 'editable'),
            Readable: extractSimpleTag(permissionBlock, 'readable')
          };
          break;
          
        case 'objectPermissions':
          permData = {
            Object: extractSimpleTag(permissionBlock, 'object'),
            AllowCreate: extractSimpleTag(permissionBlock, 'allowCreate'),
            AllowDelete: extractSimpleTag(permissionBlock, 'allowDelete'),
            AllowEdit: extractSimpleTag(permissionBlock, 'allowEdit'),
            AllowRead: extractSimpleTag(permissionBlock, 'allowRead'),
            ModifyAllRecords: extractSimpleTag(permissionBlock, 'modifyAllRecords'),
            ViewAllRecords: extractSimpleTag(permissionBlock, 'viewAllRecords')
          };
          break;
          
        case 'layoutAssignments':
          permData = {
            Layout: extractSimpleTag(permissionBlock, 'layout'),
            RecordType: extractSimpleTag(permissionBlock, 'recordType') || 'Master'
          };
          break;
          
        case 'tabVisibilities':
          permData = {
            Tab: extractSimpleTag(permissionBlock, 'tab'),
            Visibility: extractSimpleTag(permissionBlock, 'visibility')
          };
          break;
          
        case 'recordTypeVisibilities':
          permData = {
            RecordType: extractSimpleTag(permissionBlock, 'recordType'),
            Default: extractSimpleTag(permissionBlock, 'default'),
            Visible: extractSimpleTag(permissionBlock, 'visible')
          };
          break;
          
        default:
          // For any other type, extract all tags
          const tags = permissionBlock.match(/<([^>\/]+)>([\s\S]*?)<\/\1>/g) || [];
          tags.forEach(tag => {
            const nameMatch = tag.match(/<([^>\/]+)>/);
            const valueMatch = tag.match(/>([^<]*)</);
            if (nameMatch && valueMatch) {
              permData[nameMatch[1]] = valueMatch[1].trim();
            }
          });
      }
      
      results.push(permData);
    }
    
    return { data: results, count };
  }
  
  /**
   * Extract content from a simple XML tag
   * @param {string} xml - The XML content to search
   * @param {string} tagName - The tag name to find
   * @returns {string} - The content of the tag
   */
  function extractSimpleTag(xml, tagName) {
    const match = xml.match(new RegExp(`<${tagName}>([^<]*)</${tagName}>`));
    return match ? match[1].trim() : '';
  }
  
  /**
   * Convert an array of objects to CSV format
   * @param {Array} data - Array of objects to convert
   * @returns {string} - CSV formatted string
   */
  function convertArrayToCSV(data) {
    if (!data || data.length === 0) return '';
    
    // Get all unique keys
    const allKeys = new Set();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    // Convert Set to Array for consistent order
    const headers = Array.from(allKeys);
    
    // Create CSV header row
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header] !== undefined ? item[header] : '';
        // Escape values with quotes if needed
        return value.includes(',') || value.includes('"') || value.includes('\n') ? 
          '"' + value.replace(/"/g, '""') + '"' : value;
      });
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }
  
  // Add event listeners for individual checkboxes
  document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.permission-type input[type="checkbox"]:not(#selectAll)');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateSelectAll);
    });
  });
  
  // Return public API
  return {
    toggleAllPermissions,
    loadFile,
    convertToCSV
  };
})();