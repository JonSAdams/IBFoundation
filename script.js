document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const csvFileInput = document.getElementById('csvFile');
    const emailsTextarea = document.getElementById('emailsToRemove');
    const processButton = document.getElementById('processButton');
    const statusDiv = document.getElementById('status');
    const previewDiv = document.getElementById('preview');
    
    let csvData = null;
    
    // Enable the process button when both inputs have data
    function checkInputs() {
        if (csvData && emailsTextarea.value.trim()) {
            processButton.disabled = false;
        } else {
            processButton.disabled = true;
        }
    }
    
    // Handle CSV file upload
    csvFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        
        statusDiv.innerHTML = "Reading CSV file...";
        statusDiv.className = "";
        
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                if (results.errors.length > 0) {
                    statusDiv.innerHTML = "Error parsing CSV: " + results.errors[0].message;
                    statusDiv.className = "error";
                    return;
                }
                
                csvData = results.data;
                statusDiv.innerHTML = `CSV loaded successfully. Found ${csvData.length} rows of data.`;
                statusDiv.className = "success";
                
                // Show a preview of the data
                showPreview(csvData.slice(0, 5), results.meta.fields);
                
                checkInputs();
            },
            error: function(error) {
                statusDiv.innerHTML = "Error reading file: " + error;
                statusDiv.className = "error";
            }
        });
    });
    
    // Enable/disable process button when emails textarea changes
    emailsTextarea.addEventListener('input', checkInputs);
    
    // Process button click handler
    processButton.addEventListener('click', function() {
        if (!csvData) {
            statusDiv.innerHTML = "Please upload a CSV file first.";
            statusDiv.className = "error";
            return;
        }
        
        const emailText = emailsTextarea.value.trim();
        if (!emailText) {
            statusDiv.innerHTML = "Please enter emails to remove.";
            statusDiv.className = "error";
            return;
        }
        
        // Parse the comma-separated emails and clean them
        const emailsToRemove = emailText.split(',')
            .map(email => email.trim().toLowerCase())
            .filter(email => email); // Remove empty entries
        
        if (emailsToRemove.length === 0) {
            statusDiv.innerHTML = "No valid emails to remove were found.";
            statusDiv.className = "error";
            return;
        }
        
        statusDiv.innerHTML = `Processing... Filtering out ${emailsToRemove.length} emails.`;
        
        // Create a Set for faster lookups
        const emailSet = new Set(emailsToRemove);
        
        // Filter the CSV data
        const filteredData = csvData.filter(row => {
            // We need to find the username field which contains emails
            const username = row.Username || row.username || Object.values(row)[0];
            return !emailSet.has(username.toLowerCase());
        });
        
        statusDiv.innerHTML = `Removed ${csvData.length - filteredData.length} rows. ${filteredData.length} rows remaining.`;
        statusDiv.className = "success";
        
        // Convert filtered data back to CSV and download
        const csv = Papa.unparse(filteredData);
        downloadCSV(csv, 'filtered_data.csv');
    });
    
    // Show a preview of the data
    function showPreview(data, headers) {
        if (!data || data.length === 0) {
            previewDiv.innerHTML = "No data to preview";
            return;
        }
        
        let tableHtml = '<table><thead><tr>';
        
        // Add table headers
        headers.forEach(header => {
            tableHtml += `<th>${header}</th>`;
        });
        
        tableHtml += '</tr></thead><tbody>';
        
        // Add table rows
        data.forEach(row => {
            tableHtml += '<tr>';
            headers.forEach(header => {
                tableHtml += `<td>${row[header] || ''}</td>`;
            });
            tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table>';
        
        previewDiv.innerHTML = tableHtml;
    }
    
    // Function to download CSV
    function downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});