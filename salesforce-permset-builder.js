/**
 * Salesforce Permission Set Builder
 * A tool to create Salesforce Permission Set XML from CSV data
 */

const permsetBuilder = (function() {
  // Store all added permissions
  const permissions = {
    userPermissions: [],
    objectPermissions: [],
    fieldPermissions: [],
    classAccesses: [],
    pageAccesses: [],
    tabVisibilities: [],
    applicationVisibilities: [],
    customMetadataTypeAccesses: [],
    customSettingAccesses: [],
    externalDataSourceAccesses: [],
    flowAccesses: [],
    recordTypeVisibilities: []
  };
  
  /**
   * Show a specific tab in the format guide
   * @param {string} tabId - The ID of the tab to display
   */
  function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Deactivate all tab links
    document.querySelectorAll('.tab-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Show the selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // Activate the clicked tab link
    event.target.classList.add('active');
  }
  
  /**
   * Handle file upload and process CSV
   */
  function handleFileUpload() {
    const fileInput = document.getElementById('csv-file');
    const fileNameElement = document.getElementById('file-name');
    
    if (fileInput.files.length === 0) {
      fileNameElement.textContent = 'No file selected';
      return;
    }
    
    const file = fileInput.files[0];
    fileNameElement.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('csv-input').value = e.target.result;
    };
    reader.readAsText(file);
  }
  
  /**
   * Toggle custom API name input visibility
   */
  document.addEventListener('DOMContentLoaded', function() {
    const customApiCheck = document.getElementById('custom-api-name');
    const apiNameInput = document.getElementById('api-name-input');
    
    if (customApiCheck && apiNameInput) {
      customApiCheck.addEventListener('change', function() {
        apiNameInput.classList.toggle('hidden', !this.checked);
      });
    }
  });
  
  /**
   * Process permissions from CSV input
   */
  function processPermissions() {
    const csvInput = document.getElementById('csv-input').value.trim();
    if (!csvInput) {
      alert('Please provide CSV content.');
      return;
    }
    
    const permissionType = document.getElementById('permission-type').value;
    
    try {
      const parsedPermissions = parseCSV(csvInput, permissionType);
      if (parsedPermissions.length === 0) {
        alert('No valid permissions found in the CSV.');
        return;
      }
      
      // Add the parsed permissions to our store
      permissions[permissionType] = permissions[permissionType].concat(parsedPermissions);
      
      // Remove duplicates
      deduplicatePermissions(permissionType);
      
      // Update the UI
      updatePermissionsSummary();
      
      // Clear input
      document.getElementById('csv-input').value = '';
      document.getElementById('csv-file').value = '';
      document.getElementById('file-name').textContent = 'No file selected';
      
      alert(`Successfully added ${parsedPermissions.length} ${permissionType}.`);
    } catch (error) {
      alert('Error processing CSV: ' + error.message);
    }
  }
  
  /**
   * Parse CSV content based on permission type
   * @param {string} csvContent - The CSV content to parse
   * @param {string} permissionType - The type of permission
   * @returns {Array} - Array of parsed permission objects
   */
  function parseCSV(csvContent, permissionType) {
    // Split CSV into lines
    const lines = csvContent.split(/\r?\n/);
    
    // Remove empty lines
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    
    if (nonEmptyLines.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row.');
    }
    
    // Parse header row
    const header = parseCSVLine(nonEmptyLines[0]);
    
    // Validate header based on permission type
    validateHeader(header, permissionType);
    
    // Parse data rows
    const parsedPermissions = [];
    
    for (let i = 1; i < nonEmptyLines.length; i++) {
      const line = nonEmptyLines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      
      // Skip if we don't have enough values
      if (values.length < header.length) continue;
      
      // Create permission object based on type
      const permission = createPermissionObject(header, values, permissionType);
      
      if (permission) {
        parsedPermissions.push(permission);
      }
    }
    
    return parsedPermissions;
  }
  
  /**
   * Parse a CSV line respecting quoted values
   * @param {string} line - The CSV line to parse
   * @returns {Array} - Array of values
   */
  function parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue);
    
    return values;
  }
  
  /**
   * Validate CSV header for the specified permission type
   * @param {Array} header - Array of header column names
   * @param {string} permissionType - The type of permission
   */
  function validateHeader(header, permissionType) {
    let requiredColumns = [];
    
    switch (permissionType) {
      case 'userPermissions':
        requiredColumns = ['PermissionName', 'Enabled'];
        break;
      case 'objectPermissions':
        requiredColumns = ['Object', 'AllowCreate', 'AllowRead', 'AllowEdit', 'AllowDelete', 'ViewAllRecords', 'ModifyAllRecords'];
        break;
      case 'fieldPermissions':
        requiredColumns = ['Field', 'Readable', 'Editable'];
        break;
      case 'classAccesses':
        requiredColumns = ['ApexClass', 'Enabled'];
        break;
      case 'pageAccesses':
        requiredColumns = ['ApexPage', 'Enabled'];
        break;
      case 'tabVisibilities':
        requiredColumns = ['Tab', 'Visibility'];
        break;
      case 'applicationVisibilities':
        requiredColumns = ['Application', 'Visible', 'Default'];
        break;
      case 'customMetadataTypeAccesses':
      case 'customSettingAccesses':
      case 'externalDataSourceAccesses':
      case 'flowAccesses':
        requiredColumns = ['Name', 'Enabled'];
        break;
      case 'recordTypeVisibilities':
        requiredColumns = ['RecordType', 'Visible', 'Default'];
        break;
    }
    
    // Case-insensitive check for all required columns
    const headerLower = header.map(col => col.toLowerCase());
    const missingColumns = requiredColumns.filter(col => 
      !headerLower.includes(col.toLowerCase())
    );
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
  }
  
  /**
   * Create a permission object based on type
   * @param {Array} header - Array of header column names
   * @param {Array} values - Array of values
   * @param {string} permissionType - The type of permission
   * @returns {Object} - Permission object
   */
  function createPermissionObject(header, values, permissionType) {
    const permission = {};
    
    // Create an object from header and values
    header.forEach((col, index) => {
      const colLower = col.toLowerCase();
      
      // Handle special case for boolean values
      if (['enabled', 'allowcreate', 'allowread', 'allowedit', 'allowdelete', 
           'viewallrecords', 'modifyallrecords', 'readable', 'editable',
           'visible', 'default'].includes(colLower)) {
        permission[col] = convertToBoolean(values[index]);
      } else {
        permission[col] = values[index];
      }
    });
    
    // Validate required fields based on permission type
    switch (permissionType) {
      case 'userPermissions':
        if (!permission.PermissionName) return null;
        return {
          name: permission.PermissionName,
          enabled: permission.Enabled
        };
        
      case 'objectPermissions':
        if (!permission.Object) return null;
        return {
          object: permission.Object,
          allowCreate: permission.AllowCreate,
          allowRead: permission.AllowRead,
          allowEdit: permission.AllowEdit,
          allowDelete: permission.AllowDelete,
          viewAllRecords: permission.ViewAllRecords,
          modifyAllRecords: permission.ModifyAllRecords
        };
        
      case 'fieldPermissions':
        if (!permission.Field) return null;
        return {
          field: permission.Field,
          readable: permission.Readable,
          editable: permission.Editable
        };
        
      case 'classAccesses':
        if (!permission.ApexClass) return null;
        return {
          apexClass: permission.ApexClass,
          enabled: permission.Enabled
        };
        
      case 'pageAccesses':
        if (!permission.ApexPage) return null;
        return {
          apexPage: permission.ApexPage,
          enabled: permission.Enabled
        };
        
      case 'tabVisibilities':
        if (!permission.Tab) return null;
        // Validate visibility value
        const validVisibilities = ['DefaultOn', 'DefaultOff', 'Available', 'Hidden'];
        const visibility = permission.Visibility.trim();
        if (!validVisibilities.includes(visibility)) {
          console.warn(`Invalid tab visibility value: ${visibility}. Using 'Hidden' instead.`);
          permission.Visibility = 'Hidden';
        }
        return {
          tab: permission.Tab,
          visibility: permission.Visibility
        };
        
      case 'applicationVisibilities':
        if (!permission.Application) return null;
        return {
          application: permission.Application,
          visible: permission.Visible,
          default: permission.Default
        };
        
      case 'customMetadataTypeAccesses':
        if (!permission.Name) return null;
        return {
          name: permission.Name,
          enabled: permission.Enabled
        };
        
      case 'customSettingAccesses':
        if (!permission.Name) return null;
        return {
          name: permission.Name,
          enabled: permission.Enabled
        };
        
      case 'externalDataSourceAccesses':
        if (!permission.Name) return null;
        return {
          externalDataSource: permission.Name,
          enabled: permission.Enabled
        };
        
      case 'flowAccesses':
        if (!permission.Name) return null;
        return {
          flow: permission.Name,
          enabled: permission.Enabled
        };
        
      case 'recordTypeVisibilities':
        if (!permission.RecordType) return null;
        return {
          recordType: permission.RecordType,
          visible: permission.Visible,
          default: permission.Default || false
        };
    }
    
    return null;
  }
  
  /**
   * Convert a string value to boolean
   * @param {string} value - String representation of boolean
   * @returns {boolean} - Boolean value
   */
  function convertToBoolean(value) {
    const strValue = String(value).toLowerCase().trim();
    return ['true', 'yes', '1', 'y'].includes(strValue);
  }
  
  /**
   * Remove duplicate permissions
   * @param {string} permissionType - The type of permission to deduplicate
   */
  function deduplicatePermissions(permissionType) {
    const uniqueMap = new Map();
    
    permissions[permissionType].forEach(perm => {
      // Create unique key based on permission type
      let key;
      
      switch (permissionType) {
        case 'userPermissions':
          key = perm.name;
          break;
        case 'objectPermissions':
          key = perm.object;
          break;
        case 'fieldPermissions':
          key = perm.field;
          break;
        case 'classAccesses':
          key = perm.apexClass;
          break;
        case 'pageAccesses':
          key = perm.apexPage;
          break;
        case 'tabVisibilities':
          key = perm.tab;
          break;
        case 'applicationVisibilities':
          key = perm.application;
          break;
        case 'customMetadataTypeAccesses':
        case 'customSettingAccesses':
          key = perm.name;
          break;
        case 'externalDataSourceAccesses':
          key = perm.externalDataSource;
          break;
        case 'flowAccesses':
          key = perm.flow;
          break;
        case 'recordTypeVisibilities':
          key = perm.recordType;
          break;
      }
      
      // Add to map (this will automatically replace duplicates)
      uniqueMap.set(key, perm);
    });
    
    // Convert map back to array
    permissions[permissionType] = Array.from(uniqueMap.values());
  }
  
  /**
   * Update permissions summary display
   */
  function updatePermissionsSummary() {
    const summaryElement = document.getElementById('permissions-summary');
    
    // Check if any permissions are added
    const totalPermissions = Object.values(permissions).reduce((total, arr) => total + arr.length, 0);
    
    if (totalPermissions === 0) {
      summaryElement.innerHTML = '<p>No permissions added yet.</p>';
      return;
    }
    
    let html = '';
    
    // User permissions
    if (permissions.userPermissions.length > 0) {
      html += createPermissionGroupHTML('User Permissions', permissions.userPermissions, 'userPermissions');
    }
    
    // Object permissions
    if (permissions.objectPermissions.length > 0) {
      html += createPermissionGroupHTML('Object Permissions', permissions.objectPermissions, 'objectPermissions');
    }
    
    // Field permissions
    if (permissions.fieldPermissions.length > 0) {
      html += createPermissionGroupHTML('Field Permissions', permissions.fieldPermissions, 'fieldPermissions');
    }
    
    // Class accesses
    if (permissions.classAccesses.length > 0) {
      html += createPermissionGroupHTML('Class Access', permissions.classAccesses, 'classAccesses');
    }
    
    // Page accesses
    if (permissions.pageAccesses.length > 0) {
      html += createPermissionGroupHTML('Page Access', permissions.pageAccesses, 'pageAccesses');
    }
    
    // Tab visibilities
    if (permissions.tabVisibilities.length > 0) {
      html += createPermissionGroupHTML('Tab Visibility', permissions.tabVisibilities, 'tabVisibilities');
    }
    
    // Application visibilities
    if (permissions.applicationVisibilities.length > 0) {
      html += createPermissionGroupHTML('Application Visibility', permissions.applicationVisibilities, 'applicationVisibilities');
    }
    
    // Custom metadata type accesses
    if (permissions.customMetadataTypeAccesses.length > 0) {
      html += createPermissionGroupHTML('Custom Metadata Access', permissions.customMetadataTypeAccesses, 'customMetadataTypeAccesses');
    }
    
    // Custom setting accesses
    if (permissions.customSettingAccesses.length > 0) {
      html += createPermissionGroupHTML('Custom Setting Access', permissions.customSettingAccesses, 'customSettingAccesses');
    }
    
    // External data source accesses
    if (permissions.externalDataSourceAccesses.length > 0) {
      html += createPermissionGroupHTML('External Data Source Access', permissions.externalDataSourceAccesses, 'externalDataSourceAccesses');
    }
    
    // Flow accesses
    if (permissions.flowAccesses.length > 0) {
      html += createPermissionGroupHTML('Flow Access', permissions.flowAccesses, 'flowAccesses');
    }
    
    // Record type visibilities
    if (permissions.recordTypeVisibilities.length > 0) {
      html += createPermissionGroupHTML('Record Type Visibility', permissions.recordTypeVisibilities, 'recordTypeVisibilities');
    }
    
    summaryElement.innerHTML = html;
    
    // Add event listeners for remove buttons
    document.querySelectorAll('.permission-remove').forEach(button => {
      button.addEventListener('click', function() {
        const type = this.getAttribute('data-type');
        const index = parseInt(this.getAttribute('data-index'));
        
        if (type && !isNaN(index)) {
          permissions[type].splice(index, 1);
          updatePermissionsSummary();
        }
      });
    });
  }
  
  /**
   * Create HTML for a permission group
   * @param {string} title - The group title
   * @param {Array} items - Array of permission items
   * @param {string} type - The permission type
   * @returns {string} - HTML for the permission group
   */
  function createPermissionGroupHTML(title, items, type) {
    let html = `
      <div class="permission-group">
        <h3>${title} <span class="permission-count">${items.length}</span></h3>
        <div class="permission-group-list">
    `;
    
    items.forEach((item, index) => {
      let displayName;
      let details = '';
      
      switch (type) {
        case 'userPermissions':
          displayName = item.name;
          details = `Enabled: ${item.enabled}`;
          break;
        case 'objectPermissions':
          displayName = item.object;
          details = `Create: ${item.allowCreate}, Read: ${item.allowRead}, Edit: ${item.allowEdit}, Delete: ${item.allowDelete}`;
          break;
        case 'fieldPermissions':
          displayName = item.field;
          details = `Readable: ${item.readable}, Editable: ${item.editable}`;
          break;
        case 'classAccesses':
          displayName = item.apexClass;
          details = `Enabled: ${item.enabled}`;
          break;
        case 'pageAccesses':
          displayName = item.apexPage;
          details = `Enabled: ${item.enabled}`;
          break;
        case 'tabVisibilities':
          displayName = item.tab;
          details = `Visibility: ${item.visibility}`;
          break;
        case 'applicationVisibilities':
          displayName = item.application;
          details = `Visible: ${item.visible}, Default: ${item.default}`;
          break;
        case 'customMetadataTypeAccesses':
        case 'customSettingAccesses':
          displayName = item.name;
          details = `Enabled: ${item.enabled}`;
          break;
        case 'externalDataSourceAccesses':
          displayName = item.externalDataSource;
          details = `Enabled: ${item.enabled}`;
          break;
        case 'flowAccesses':
          displayName = item.flow;
          details = `Enabled: ${item.enabled}`;
          break;
        case 'recordTypeVisibilities':
          displayName = item.recordType;
          details = `Visible: ${item.visible}, Default: ${item.default}`;
          break;
      }
      
      html += `
        <div class="permission-item">
          <div>
            <strong>${displayName}</strong>
            <div class="permission-details">${details}</div>
          </div>
          <span class="permission-remove" data-type="${type}" data-index="${index}">✕</span>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Generate Permission Set XML
   */
  function generateXML() {
    const permsetName = document.getElementById('permset-name').value.trim();
    const description = document.getElementById('permset-description').value.trim();
    const activationRequired = document.getElementById('activation-required').checked;
    const customApiName = document.getElementById('custom-api-name').checked;
    let apiName = '';
    
    if (customApiName) {
      apiName = document.getElementById('api-name-input').value.trim();
      if (!apiName) {
        alert('Please enter an API name or uncheck the "Specify Custom API Name" option.');
        return;
      }
    } else {
      // Generate API name from label (replace spaces with underscores, remove special characters)
      apiName = permsetName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
    }
    
    if (!permsetName) {
      alert('Please enter a name for the Permission Set.');
      return;
    }
    
    // Start XML with required elements
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">\n';
    
    // Add API name if specified
    if (apiName) {
      xml += `  <fullName>${escapeXml(apiName)}</fullName>\n`;
    }
    
    // Add description if provided
    if (description) {
      xml += `  <description>${escapeXml(description)}</description>\n`;
    } else {
      xml += `  <description>Permission Set: ${escapeXml(permsetName)}</description>\n`;
    }
    
    // Add hasActivationRequired
    xml += `  <hasActivationRequired>${activationRequired}</hasActivationRequired>\n`;
    
    // Add label (required)
    xml += `  <label>${escapeXml(permsetName)}</label>\n`;
    
    // Add license (always Salesforce as specified)
    xml += '  <license>Salesforce</license>\n';
    
    // Add application visibilities
    permissions.applicationVisibilities.forEach(perm => {
      xml += '  <applicationVisibilities>\n';
      xml += `    <application>${escapeXml(perm.application)}</application>\n`;
      xml += `    <default>${perm.default}</default>\n`;
      xml += `    <visible>${perm.visible}</visible>\n`;
      xml += '  </applicationVisibilities>\n';
    });
    
    // Add class accesses
    permissions.classAccesses.forEach(perm => {
      xml += '  <classAccesses>\n';
      xml += `    <apexClass>${escapeXml(perm.apexClass)}</apexClass>\n`;
      xml += `    <enabled>${perm.enabled}</enabled>\n`;
      xml += '  </classAccesses>\n';
    });
    
    // Add custom metadata type accesses
    permissions.customMetadataTypeAccesses.forEach(perm => {
      xml += '  <customMetadataTypeAccesses>\n';
      xml += `    <enabled>${perm.enabled}</enabled>\n`;
      xml += `    <name>${escapeXml(perm.name)}</name>\n`;
      xml += '  </customMetadataTypeAccesses>\n';
    });
    
    // Add custom setting accesses
    permissions.customSettingAccesses.forEach(perm => {
      xml += '  <customSettingAccesses>\n';
      xml += `    <enabled>${perm.enabled}</enabled>\n`;
      xml += `    <name>${escapeXml(perm.name)}</name>\n`;
      xml += '  </customSettingAccesses>\n';
    });
    
    // Add external data source accesses
    permissions.externalDataSourceAccesses.forEach(perm => {
      xml += '  <externalDataSourceAccesses>\n';
      xml += `    <enabled>${perm.enabled}</enabled>\n`;
      xml += `    <externalDataSource>${escapeXml(perm.externalDataSource)}</externalDataSource>\n`;
      xml += '  </externalDataSourceAccesses>\n';
    });
    
    // Add field permissions
    permissions.fieldPermissions.forEach(perm => {
      xml += '  <fieldPermissions>\n';
      xml += `    <editable>${perm.editable}</editable>\n`;
      xml += `    <field>${escapeXml(perm.field)}</field>\n`;
      xml += `    <readable>${perm.readable}</readable>\n`;
      xml += '  </fieldPermissions>\n';
    });
    
    // Add flow accesses
    permissions.flowAccesses.forEach(perm => {
      xml += '  <flowAccesses>\n';
      xml += `    <enabled>${perm.enabled}</enabled>\n`;
      xml += `    <flow>${escapeXml(perm.flow)}</flow>\n`;
      xml += '  </flowAccesses>\n';
    });
    
    // Add object permissions
    permissions.objectPermissions.forEach(perm => {
      xml += '  <objectPermissions>\n';
      xml += `    <allowCreate>${perm.allowCreate}</allowCreate>\n`;
      xml += `    <allowDelete>${perm.allowDelete}</allowDelete>\n`;
      xml += `    <allowEdit>${perm.allowEdit}</allowEdit>\n`;
      xml += `    <allowRead>${perm.allowRead}</allowRead>\n`;
      xml += `    <modifyAllRecords>${perm.modifyAllRecords}</modifyAllRecords>\n`;
      xml += `    <object>${escapeXml(perm.object)}</object>\n`;
      xml += `    <viewAllRecords>${perm.viewAllRecords}</viewAllRecords>\n`;
      xml += '  </objectPermissions>\n';
    });
    
    // Add page accesses
    permissions.pageAccesses.forEach(perm => {
      xml += '  <pageAccesses>\n';
      xml += `    <apexPage>${escapeXml(perm.apexPage)}</apexPage>\n`;
      xml += `    <enabled>${perm.enabled}</enabled>\n`;
      xml += '  </pageAccesses>\n';
    });
    
    // Add record type visibilities
    permissions.recordTypeVisibilities.forEach(perm => {
      xml += '  <recordTypeVisibilities>\n';
      xml += `    <recordType>${escapeXml(perm.recordType)}</recordType>\n`;
      xml += `    <visible>${perm.visible}</visible>\n`;
      if (perm.default) {
        xml += `    <default>${perm.default}</default>\n`;
      }
      xml += '  </recordTypeVisibilities>\n';
    });
    
    // Add tab visibilities
    permissions.tabVisibilities.forEach(perm => {
      xml += '  <tabVisibilities>\n';
      xml += `    <tab>${escapeXml(perm.tab)}</tab>\n`;
      xml += `    <visibility>${perm.visibility}</visibility>\n`;
      xml += '  </tabVisibilities>\n';
    });
    
    // Add user permissions
    permissions.userPermissions.forEach(perm => {
      xml += '  <userPermissions>\n';
      xml += `    <enabled>${perm.enabled}</enabled>\n`;
      xml += `    <name>${escapeXml(perm.name)}</name>\n`;
      xml += '  </userPermissions>\n';
    });
    
    // Close PermissionSet tag
    xml += '</PermissionSet>';
    
    // Display the XML
    document.getElementById('xml-output').value = xml;
  }
  
  /**
   * Escape XML special characters
   * @param {string} str - String to escape
   * @returns {string} - Escaped string
   */
  function escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  /**
   * Copy XML output to clipboard
   */
  function copyToClipboard() {
    const outputElem = document.getElementById('xml-output');
    outputElem.select();
    document.execCommand('copy');
    
    alert('XML copied to clipboard!');
  }
  
  /**
   * Download XML as a file
   */
  function downloadXML() {
    const outputElem = document.getElementById('xml-output');
    const xmlContent = outputElem.value;
    
    if (!xmlContent) {
      alert('Please generate XML first.');
      return;
    }
    
    const permsetName = document.getElementById('permset-name').value.trim() || 'PermissionSet';
    const fileName = `${permsetName.replace(/\s+/g, '_')}.permissionset-meta.xml`;
    
    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    URL.revokeObjectURL(url);
  }
  
  // Return public API
  return {
    showTab,
    handleFileUpload,
    processPermissions,
    generateXML,
    copyToClipboard,
    downloadXML
  };
})();