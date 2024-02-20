module.exports = Object.freeze({
    MY_CONSTANT: 'some value',
    ANOTHER_CONSTANT: 'another value',
    FREE_PLAN_SUBSCRIPTION_PKG_ID: '65c274d7844c7f01a3a5f7af',
    API_NAME_URL_MAPPING: {
        "/api/debtors/search": "companySearch",
        "/api/transactions/create": "invoicingLedger",
        // "/api/companies/search": "recordPayment"
    },
    API_NAME_URL_MAPPING_FOR_SUBSCRIPTION: {
        "/api/debtors/search": "Defaulter Search",
        "/api/transactions/create": "Invoicing",
        // "/api/transactions/create": "Calls"
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
    },
    DOCUMENT_TYPES:{
        PURCHASE_ORDER_DOCUMENT: ""
    }

});
