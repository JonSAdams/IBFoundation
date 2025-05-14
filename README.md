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
