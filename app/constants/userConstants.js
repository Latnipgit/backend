module.exports = Object.freeze({
    MY_CONSTANT: 'some value',
    ANOTHER_CONSTANT: 'another value',
    API_NAME_URL_MAPPING: {
        "/api/companies/search": "companySearch",
        "/api/transactions/create": "invoicingLedger",
        // "/api/companies/search": "recordPayment"
    },
    INVOICE_STATUS: {
        PAID: 'PAID',
        DEFAULTED: 'DEFAULTED',
        PENDING:"PENDING"
    },
    UPLOAD_FILE_TYPE: {
        GENERAL: 'GENERAL',
        INVOICE: 'INVOICE'
    }
});
