const express = require('express');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const app = express();
const port = 3000; // Your desired port number

app.use(express.json());

app.post('/processJSON', async (req, res) => {
  try {
    const inputData = req.body; // JSON input data
    const {fileName} = inputData;
    const downloaded_file = `${fileName}.pdf`
    const URL1 = 'https://rest-au.apitemplate.io/v2/create-pdf?template_id=d6777b230bf41fe2&export_type=file'; // Predefined URL to retrieve the PDF file
    const URL2 = 'https://bpj.rnd.infozenit.com/files'; // Predefined URL to upload the PDF file

    const customHeadersURL1 = {
        headers: {
          'X-API-KEY': 'e780OTc5Njo2ODM2Om1RZ3hJNFNORXFVN3BlQTQ' 
        }
      };

      const customHeadersURL2 = {
        headers: {
          'Authorization': 'Bearer F-JFCmJDCoa68dClgRU2ZdKvdLrL-CWW' 
        }
      };

    // Sending POST request to URL1 with JSON input data
    const response = await axios.post(URL1, inputData, {
        responseType: 'arraybuffer',
        ...customHeadersURL1
      });
    if (response.status === 200) {
      // Save the returned PDF file locally
      fs.writeFileSync(downloaded_file, response.data);

      // Re-upload the PDF file to URL2
      const fileContent = fs.readFileSync(downloaded_file);
      const formData = new FormData();
      formData.append('file', fileContent, { filename: downloaded_file });

      const uploadResponse = await axios.post(URL2, formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': 'Bearer F-JFCmJDCoa68dClgRU2ZdKvdLrL-CWW' 

        }
      });

      if (uploadResponse.status === 200) {
        // Delete the file after successful upload to URL2
        fs.unlinkSync(downloaded_file);
        res.status(200).send('File downloaded, uploaded, and deleted successfully');
      } else {
        res.status(uploadResponse.status).send(`File upload to URL2 failed with status code: ${uploadResponse.status}`);
      }
    } else {
      res.status(response.status).send(`POST request to URL1 failed with status code: ${response.status}`);
    }
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
