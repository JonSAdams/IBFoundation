/**
 * Salesforce Profile XML Deduplicator
 * 
 * This module handles merging multiple Salesforce profile XML files
 * and removing duplicate permission entries.
 */

const salesforceDeduplicator = (function() {
  // Store XML content from all files
  let xmlContents = [];
  
  /**
   * Add files from file input
   */
  function addFiles() {
    const fileInput = document.getElementById('xmlFileInput');
    const files = fileInput.files;
    
    if (files.length === 0) {
      alert('Please select at least one XML file.');
      return;
    }
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        // Add file content to our array
        xmlContents.push({
          name: file.name,
          content: e.target.result
        });
        
        // Update file list display
        updateFileList();
      };
      
      reader.readAsText(file);
    });
    
    // Clear file input
    fileInput.value = '';
  }
  
  /**
   * Add content from manual input
   */
  function addManualInput() {
    const manualInput = document.getElementById('manualInput');
    const content = manualInput.value.trim();
    
    if (!content) {
      alert('Please enter some XML content.');
      return;
    }
    
    // Add manual content to our array
    xmlContents.push({
      name: `Manual Input ${xmlContents.length + 1}`,
      content: content
    });
    
    // Update file list display
    updateFileList();
    
    // Clear manual input
    manualInput.value = '';
  }
  
  /**
   * Update file list display
   */
  function updateFileList() {
    const fileList = document.getElementById('fileList');
    
    if (xmlContents.length === 0) {
      fileList.innerHTML = '<div>No files added yet</div>';
      return;
    }
    
    let html = '';
    xmlContents.forEach((file, index) => {
      html += `
        <div class="file-item">
          <span>${file.name}</span>
          <button onclick="salesforceDeduplicator.removeFile(${index})">Remove</button>
        </div>
      `;
    });
    
    fileList.innerHTML = html;
  }
  
  /**
   * Remove file from array
   */
  function removeFile(index) {
    xmlContents.splice(index, 1);
    updateFileList();
  }
  
  /**
   * Process all XML content
   */
  function processXML() {
    if (xmlContents.length === 0) {
      alert('Please add at least one XML file or content.');
      return;
    }
    
    // Storage for unique permissions by type and identifier
    const uniquePermissions = {
      userPermissions: {},
      applicationVisibilities: {},
      classAccesses: {},
      fieldPermissions: {},
      objectPermissions: {},
      layoutAssignments: {},
      tabVisibilities: {},
      recordTypeVisibilities: {},
      // Add other permission types as needed
    };
    
    // Statistics for reporting
    const stats = {
      totalProcessed: 0,
      totalUnique: 0,
      totalDuplicates: 0,
      byType: {}
    };
    
    // Initialize stats counters for each permission type
    Object.keys(uniquePermissions).forEach(type => {
      stats.byType[type] = {
        total: 0,
        unique: 0,
        duplicates: 0
      };
    });
    
    // Process each XML file
    xmlContents.forEach(file => {
      const content = file.content;
      
      // Process each permission type
      Object.keys(uniquePermissions).forEach(permType => {
        // Find all instances of this permission type
        const regex = new RegExp(`<${permType}>([\\s\\S]*?)<\\/${permType}>`, 'g');
        let match;
        
        while ((match = regex.exec(content)) !== null) {
          const permissionBlock = match[0];
          const permissionContent = match[1].trim();
          
          // Create a unique identifier based on the permission content
          // For different permission types, we need different identifiers
          let identifier;
          
          if (permType === 'userPermissions') {
            // For userPermissions, use the name element as identifier
            const nameMatch = permissionContent.match(/<name>(.*?)<\/name>/);
            identifier = nameMatch ? nameMatch[1] : permissionContent;
          } 
          else if (permType === 'applicationVisibilities') {
            // For applicationVisibilities, use the application element
            const appMatch = permissionContent.match(/<application>(.*?)<\/application>/);
            identifier = appMatch ? appMatch[1] : permissionContent;
          }
          else if (permType === 'classAccesses') {
            // For classAccesses, use the apexClass element
            const classMatch = permissionContent.match(/<apexClass>(.*?)<\/apexClass>/);
            identifier = classMatch ? classMatch[1] : permissionContent;
          }
          else if (permType === 'fieldPermissions') {
            // For fieldPermissions, use the field element
            const fieldMatch = permissionContent.match(/<field>(.*?)<\/field>/);
            identifier = fieldMatch ? fieldMatch[1] : permissionContent;
          }
          else if (permType === 'objectPermissions') {
            // For objectPermissions, use the object element
            const objectMatch = permissionContent.match(/<object>(.*?)<\/object>/);
            identifier = objectMatch ? objectMatch[1] : permissionContent;
          }
          else if (permType === 'layoutAssignments') {
            // For layoutAssignments, combine layout and recordType if present
            const layoutMatch = permissionContent.match(/<layout>(.*?)<\/layout>/);
            const recordTypeMatch = permissionContent.match(/<recordType>(.*?)<\/recordType>/);
            
            identifier = layoutMatch ? layoutMatch[1] : '';
            if (recordTypeMatch) {
              identifier += '|' + recordTypeMatch[1];
            }
            
            if (!identifier) identifier = permissionContent;
          }
          else if (permType === 'tabVisibilities') {
            // For tabVisibilities, use the tab element
            const tabMatch = permissionContent.match(/<tab>(.*?)<\/tab>/);
            identifier = tabMatch ? tabMatch[1] : permissionContent;
          }
          else if (permType === 'recordTypeVisibilities') {
            // For recordTypeVisibilities, use the recordType element
            const recordTypeMatch = permissionContent.match(/<recordType>(.*?)<\/recordType>/);
            identifier = recordTypeMatch ? recordTypeMatch[1] : permissionContent;
          }
          else {
            // For any other types, use the entire content as identifier
            identifier = permissionContent;
          }
          
          // Update stats
          stats.totalProcessed++;
          stats.byType[permType].total++;
          
          // Check if we've seen this permission before
          if (!uniquePermissions[permType][identifier]) {
            // This is a new unique permission
            uniquePermissions[permType][identifier] = permissionBlock;
            stats.totalUnique++;
            stats.byType[permType].unique++;
          } else {
            // This is a duplicate
            stats.totalDuplicates++;
            stats.byType[permType].duplicates++;
          }
        }
      });
    });
    
    // Build the final XML output
    let outputXml = '<?xml version="1.0" encoding="UTF-8"?>\n<Profile xmlns="http://soap.sforce.com/2006/04/metadata">\n';
    
    // Add each permission type block
    Object.keys(uniquePermissions).forEach(permType => {
      // Add all unique permissions of this type
      Object.values(uniquePermissions[permType]).forEach(permBlock => {
        outputXml += '    ' + permBlock + '\n';
      });
    });
    
    // Close the profile tag
    outputXml += '</Profile>';
    
    // Display the result
    document.getElementById('output').value = outputXml;
    
    // Display statistics
    updateStats(stats);
  }
  
  /**
   * Update statistics display
   */
  function updateStats(stats) {
    const statsDiv = document.getElementById('stats');
    
    let html = '<h3>Statistics:</h3>';
    html += `<p>Total permissions processed: ${stats.totalProcessed}</p>`;
    html += `<p>Unique permissions: ${stats.totalUnique}</p>`;
    html += `<p>Duplicates removed: ${stats.totalDuplicates}</p>`;
    
    html += '<table>';
    html += '<tr><th>Permission Type</th><th>Total</th><th>Unique</th><th>Duplicates</th></tr>';
    
    Object.keys(stats.byType).forEach(type => {
      const typeStats = stats.byType[type];
      if (typeStats.total > 0) {
        html += `<tr>
                  <td>${type}</td>
                  <td>${typeStats.total}</td>
                  <td>${typeStats.unique}</td>
                  <td>${typeStats.duplicates}</td>
                </tr>`;
      }
    });
    
    html += '</table>';
    
    statsDiv.innerHTML = html;
  }
  
  /**
   * Copy result to clipboard
   */
  function copyToClipboard() {
    const outputElem = document.getElementById('output');
    outputElem.select();
    document.execCommand('copy');
    
    // Visual feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }
  
  // Return public methods
  return {
    addFiles,
    addManualInput,
    removeFile,
    processXML,
    copyToClipboard
  };
})();