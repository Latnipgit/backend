const multer = require('multer');

module.exports = app => {
    const fileUpload = require("../../controllers/common/fileUpload.controller.js");
    const upload = multer();
    const auth = require("../../middleware/authentication.js");

    const router = require("express").Router();

    router.post("/upload", auth, upload.single('file'), fileUpload.uploadFile);
    router.get("/allFileData", fileUpload.getAllUploadedDocuments);
    router.post("/download", fileUpload.downloadFile);

    app.use("/api/files", router);
};