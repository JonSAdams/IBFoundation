# masterWorkFile

This project is all about learning how to code and about learning how to style a page that I like. I expect for this project to be messy but useful for me as I work.

## Salesforce Profile XML Deduplicator - Documentation

This tool allows you to merge multiple Salesforce profile XML files and remove duplicate permissions, resulting in a consolidated profile with all unique permissions.

### Files in this Package

1. **salesforce-deduplicator-index.html** - The main HTML file containing the application structure
2. **salesforce-deduplicator-styles.css** - CSS styles for the application
3. **salesforce-deduplicator-processor.js** - JavaScript that handles the XML processing and deduplication logic

### How to Use

1. Download all three files and place them in the same directory
2. Open **salesforce-deduplicator-index.html** in any modern web browser
3. Add Salesforce XML profile content using one or both of these methods:
   - Upload one or more XML files using the file input
   - Paste XML content directly into the manual input area
4. Click "Process XML Files" to deduplicate and merge the content
5. View the resulting consolidated XML in the output area
6. Use "Copy to Clipboard" to copy the result for use elsewhere
7. Review the statistics section to see how many duplicates were removed

### Deduplication Process

The tool works by:

1. Parsing each XML file to identify permission blocks (e.g., userPermissions, objectPermissions, etc.)
2. For each permission type, creating a unique identifier based on key attributes:
   - For userPermissions: the name element
   - For objectPermissions: the object element
   - For fieldPermissions: the field element
   - etc.
3. Using these identifiers to detect and remove duplicates
4. Generating a new XML file with all unique permissions

### Supported Permission Types

The tool handles deduplication for these permission types:

- userPermissions
- applicationVisibilities
- classAccesses
- fieldPermissions
- objectPermissions
- layoutAssignments
- tabVisibilities
- recordTypeVisibilities

### Technical Details

- The tool runs entirely in your browser - no data is sent to any server
- XML parsing is done using regular expressions
- The output is formatted as a standard Salesforce profile XML file
- Detailed statistics show how many duplicates were found for each permission type

### Use Cases

- Merging permissions from multiple profiles
- Combining development and production profiles
- Creating a consolidated profile for migration
- Auditing and cleaning up redundant permissions
- Generating a master profile with all permissions from multiple sources

### Troubleshooting

If you encounter issues:

1. Make sure your XML is valid Salesforce profile XML
2. Check that the input XML includes the necessary opening and closing tags
3. Try processing files individually if you're having issues with multiple files
4. If the output appears empty, check that your input files contained supported permission types

## Salesforce XML to CSV Converter - Documentation

This tool allows you to convert Salesforce profile and permission set XML into CSV format for easier analysis, comparison, and manipulation.

### Files in this Package

1. **salesforce-xml-converter-index.html** - The main HTML file containing the structure of the application
2. **salesforce-xml-converter-styles.css** - CSS styles for the application
3. **salesforce-xml-processor.js** - JavaScript that handles the XML parsing and CSV generation logic

### How to Use

1. Download all three files and place them in the same directory
2. Open **salesforce-xml-converter-index.html** in any modern web browser
3. Input your Salesforce XML in one of two ways:
   - Paste directly into the text area
   - Use the "Load from File" button to upload an XML file
4. Select which permission types you want to extract using the checkboxes
5. Click "Convert to CSV" to process the XML
6. Download the resulting CSV files:
   - Individual CSV files for each permission type
   - Combined CSV with all permissions in one file

### Supported Permission Types

The tool can extract the following permission types from Salesforce XML:

- **userPermissions** - User-level permissions (e.g., "ViewSetup", "ApiEnabled")
- **applicationVisibilities** - App visibility settings
- **classAccesses** - Apex class access permissions
- **fieldPermissions** - Field-level permissions
- **objectPermissions** - Object-level permissions
- **layoutAssignments** - Page layout assignments
- **tabVisibilities** - Tab visibility settings
- **recordTypeVisibilities** - Record type visibility settings

### Technical Details

- The tool runs entirely in your browser - no data is sent to any server
- XML parsing is done using regular expressions for speed and simplicity
- CSV files are properly escaped for compatibility with standard spreadsheet applications
- The tool supports large XML files (limited only by your browser's memory)

### Troubleshooting

If you encounter issues:

1. Make sure your XML is valid Salesforce profile or permission set XML
2. Try with a smaller subset of the XML if you're processing a very large file
3. Check that you've selected at least one permission type to extract
4. Ensure all three files are in the same directory if running locally

### Example Usage Scenarios

- Compare permissions across multiple profiles
- Audit user permissions in your org
- Prepare permission data for import into other systems
- Generate reports about field-level security
- Analyze object permissions across profiles

## Salesforce Permission Set Builder - Documentation

This tool allows you to easily create Salesforce Permission Set XML files from CSV data. It helps Salesforce administrators and developers quickly build permission sets without manually creating XML.

### Files in this Package

1. **salesforce-permset-builder-index.html** - The main HTML file containing the application structure
2. **salesforce-permset-builder-styles.css** - CSS styles for the application
3. **salesforce-permset-builder.js** - JavaScript code that handles the CSV parsing and XML generation logic

### How to Use

1. Download all three files and place them in the same directory
2. Open **salesforce-permset-builder-index.html** in any modern web browser
3. Enter a name and description for your permission set
4. Choose whether the permission set requires activation
5. Add permissions by either:
   - Uploading a CSV file
   - Pasting CSV content directly
6. Select the type of permission you're adding (User Permission, Object Permission, etc.)
7. Click "Add Permissions" to process the CSV data
8. Repeat steps 5-7 for different permission types as needed
9. Click "Generate Permission Set XML" to create the XML file
10. Copy or download the generated XML for use in Salesforce

### CSV Format Requirements

The tool supports four types of permissions, each with its own required CSV format:

#### User Permissions

```
PermissionName,Enabled
EditTask,true
EditEvent,true
ManageUsers,false
```

#### Object Permissions

```
Object,AllowCreate,AllowRead,AllowEdit,AllowDelete,ViewAllRecords,ModifyAllRecords
Account,true,true,true,false,false,false
Contact,true,true,true,false,false,false
```

#### Field Permissions

```
Field,Readable,Editable
Account.Industry,true,true
Account.Type,true,false
Contact.Email,true,true
```

#### Class Access

```
ApexClass,Enabled
AccountController,true
ContactService,true
```

### Features

- **Easy Permission Entry**: Upload CSV files or paste CSV content
- **Multiple Permission Types**: Support for user permissions, object permissions, field permissions, and class access
- **Deduplication**: Automatically handles duplicate entries
- **Preview**: See all added permissions before generating XML
- **Downloadable Output**: Save the generated XML directly as a file
- **Salesforce Standard Format**: Creates XML in the correct format for Salesforce metadata API

### Notes

- The tool always sets the license to "Salesforce" as specified
- Boolean values in CSV can be represented as "true"/"false", "yes"/"no", "1"/"0", or "y"/"n"
- The tool handles XML escaping for special characters
- All processing happens in your browser – no data is sent to any server

### Example XML Output

```xml


  Access for sales representatives
  false
  Sales Rep Access
  Salesforce
  
    true
    EditTask
  
  
    true
    false
    true
    true
    false
    Account
    false
  
  
    true
    Account.Industry
    true
  
  
    AccountController
    true
  

```

### Troubleshooting

- If you get an error while processing CSV, check that your CSV follows the required format for the selected permission type
- Ensure your CSV has a header row that matches the expected column names
- Make sure you've selected the correct permission type before clicking "Add Permissions"
- If you need to remove a permission, click the "✕" next to it in the Current Permissions section
