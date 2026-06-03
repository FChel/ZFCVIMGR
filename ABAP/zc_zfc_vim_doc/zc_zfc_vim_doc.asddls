@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'VIM Document - Consumption View'
@Metadata.allowExtensions: true
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
    serviceQuality: #X,
    sizeCategory: #S,
    dataClass: #TRANSACTIONAL
}
@Search.searchable: true

define root view entity ZC_ZFC_VIM_DOC
  provider contract transactional_query
  as projection on ZI_ZFC_VIM_DOC
{
      @EndUserText.label: 'VIM Document ID'
      @Search.defaultSearchElement: true
  key VimDocumentId,

      @EndUserText.label: 'Purchase Order'
      @Search.defaultSearchElement: true
      PurchaseOrder,

      @EndUserText.label: 'Vendor'
      @Search.defaultSearchElement: true
      @Consumption.valueHelpDefinition: [{
        entity: { name: 'I_Supplier', element: 'Supplier' }
      }]
      Vendor,

      @EndUserText.label: 'Vendor Name'
      VendorName,

      @EndUserText.label: 'Invoice Number'
      @Search.defaultSearchElement: true
      InvoiceNumber,

      @EndUserText.label: 'Status'
      @Search.defaultSearchElement: true
      ProcessStatus,
      
      @EndUserText.label: 'Status Text'
      ProcessStatusText,      

      @EndUserText.label: 'Status Criticality'
      StatusCriticality,

      @EndUserText.label: 'Net Amount'
      @Semantics.amount.currencyCode: 'Currency'
      NetAmount,

      @EndUserText.label: 'Tax Amount'
      @Semantics.amount.currencyCode: 'Currency'
      TaxAmount,

      @EndUserText.label: 'Gross Amount'
      @Semantics.amount.currencyCode: 'Currency'
      GrossAmount,

      @EndUserText.label: 'Currency'
      @Consumption.valueHelpDefinition: [{
        entity: { name: 'I_Currency', element: 'Currency' }
      }]
      Currency,

      @EndUserText.label: 'Received Date'
      ReceivedDate,

      @EndUserText.label: 'Payment Terms'
      @Consumption.valueHelpDefinition: [{
        entity: { name: 'I_PaymentTermsText', element: 'PaymentTerms' }
      }]
      PaymentTerms,

      @EndUserText.label: 'Payment Terms Description'
      PaymentTermsText,

      @EndUserText.label: 'Due Date'
      DueDate,

      @EndUserText.label: 'Overdue'
      IsDueDatePassed,

      @EndUserText.label: 'Credit Memo'
      CreditMemo,

      @EndUserText.label: 'Company Code'
      CompanyCode,

      @EndUserText.label: 'Fiscal Year'
      FiscalYear,

      @EndUserText.label: 'Accounting Document'
      AccountingDocument,

      @EndUserText.label: 'Posting Date'
      PostingDate,

      @EndUserText.label: 'Document Date'
      DocumentDate,

      @EndUserText.label: 'Current Process Type'
      CurrentProcessType,

      @EndUserText.label: 'Archive ID'
      ArchiveId,

      @EndUserText.label: 'Archive Document ID'
      ArchiveDocId,

      @EndUserText.label: 'Created By'
      CreatedBy,

      @EndUserText.label: 'Created At'
      CreatedAt,

      @EndUserText.label: 'Last Changed By'
      LastChangedBy,

      @EndUserText.label: 'Last Changed At'
      LastChangedAt,

      /* Composition child */
      _Items : redirected to composition child ZC_ZFC_VIM_DOC_ITEM,

      /* Custom entity associations — plain, no redirect needed */
      _GoodsReceipts,
      _POItems
}
