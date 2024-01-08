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
    },
    PAYMENT_HISTORY_STATUS: {
        APPROVED: "APPROVED",
        REJECTED: "REJECTED",
        PENDING: "PENDING",
        DOCUMENTS_NEEDED: "DOCUMENTS_NEEDED"
    },
    MAIL_TEMPLATES:{
        SUPPORTING_DOCUMENTS_NEEDED_DEBTOR: "SUPPORTING_DOCUMENTS_NEEDED_DEBTOR",
        SUPPORTING_DOCUMENTS_NEEDED_CREDITOR: "SUPPORTING_DOCUMENTS_NEEDED_CREDITOR"
    }

});
