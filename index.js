const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
const port = 3000; // Change this to your desired port

app.use(express.json());

app.post("/generate-pdf/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const jsonData = req.body;

    // Send a POST request to docugen-jsreport to generate PDF
    const pdfResponse = await axios.post(
      "https://docugen-jsreport.qlskns.easypanel.host/api/report",
      jsonData,
      {
        responseType: "arraybuffer", // Set responseType to 'arraybuffer' to get binary data
      }
    );

    //handle upload
    const uploadFormData = new FormData();
    uploadFormData.append("file", pdfResponse.data, `dof_${id}.pdf`); // 'filename.ext' is the desired filename

    const uploadUrl = "https://dms.rnd.infozenit.com/files";
    // Make the Axios POST request
    const pdfUloploadresponse = await axios.post(uploadUrl, uploadFormData, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${uploadFormData._boundary}`,
        Authorization: "Bearer jixTcnuKiXRrMFGYxeAU1yrxDnJFrHd5",
      },
    });

    const dofUpdateUrl = `https://dms.rnd.infozenit.com/items/Instruction_Form/${id}`;
    const dofPayload = { dof: pdfUloploadresponse.data.data.id };

    // Make the Axios PATCH request for updating the record with dof information
    const pdfUpdateResponse = await axios
      .patch(dofUpdateUrl, dofPayload, {
        headers: {
          Authorization: "Bearer jixTcnuKiXRrMFGYxeAU1yrxDnJFrHd5",
          "Content-Type": "application/json", // Set the content type to JSON
        },
      })
      .then((response) => {
        console.log("Patch successful:", response.data);
      })
      .catch((error) => {
        console.error("Error during patch:", error);
      });

    console.log(pdfUpdateResponse);
    res
      .status(200)
      .json({
        success: true,
        message: "PDF generated and uploaded successfully.",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
