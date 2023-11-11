const db = require("../../models/common");
const Documents = db.documents;
const service = require('../../service/common');
const AzureBlobService = service.azureBlobService;

exports.uploadFile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const { fileUrl, uniqueName } = await AzureBlobService.uploadFileToBlob(file.buffer, file.originalname);

        const savedFile = await Documents.create({
            name: req.file.originalname,
            url: fileUrl,
            uniqueName: uniqueName
        }); 
        res.json({message: 'File Uploaded successfully.', success: true, response: { documentId: savedFile._id }});

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Something went wrong", success: false });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const fileId = req.body.documentId;
        const file = await Documents.findById(fileId);

        if (!file) {
            return res.status(404).send('File not found');
        }

        const stream = await AzureBlobService.downloadBlob(file.url);
        res.setHeader('Content-Disposition', `attachment; filename=${file.name}`);
        stream.pipe(res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error downloading file');
    }
};

exports.getAllUploadedDocuments = async(req, res) => {
    let allDocuments;
    try {
        allDocuments = await Documents.find();

    } catch (err) {
        console.log(err)
    }

    return template;
};
