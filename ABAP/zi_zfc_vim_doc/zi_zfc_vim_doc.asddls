@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'VIM Document - Interface View'
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
    serviceQuality: #X,
    sizeCategory: #S,
    dataClass: #TRANSACTIONAL
}
define root view entity ZI_ZFC_VIM_DOC
  as select from /opt/vim_1head as VimDoc

  // Join for payment terms description
  association [0..1] to I_PaymentTermsText      as _PaymentTermsText
    on  _PaymentTermsText.PaymentTerms = $projection.PaymentTerms
    and _PaymentTermsText.Language     = $session.system_language

  // Join for vendor name
  association [0..1] to I_Supplier              as _Supplier
    on _Supplier.Supplier = $projection.Vendor

  // Composition for true child entities (persisted in /opt/vim_1item)
  composition [0..*] of ZI_ZFC_VIM_DOC_ITEM     as _Items

  // Custom entities via plain association (joined on PO)
  association [0..*] to ZC_ZFC_VIM_GR_CE        as _GoodsReceipts
    on _GoodsReceipts.PurchaseOrder = $projection.PurchaseOrder

  association [0..*] to ZC_ZFC_VIM_PO_ITEM_CE   as _POItems
    on _POItems.PurchaseOrder = $projection.PurchaseOrder

{
  key docid                            as VimDocumentId,

      // Header fields from /OPT/VIM_1HEAD
      edi_docnum                       as EdiDocumentNumber,
      status                           as ProcessStatus,
      curr_proc_type                   as CurrentProcessType,
      xblnr                            as InvoiceNumber,
      lifnr                            as Vendor,
      vend_name                        as VendorName,
      ebeln                            as PurchaseOrder,
      waers                            as Currency,

      @Semantics.amount.currencyCode: 'Currency'
      net_amount                       as NetAmount,

      @Semantics.amount.currencyCode: 'Currency'
      vat_amount                       as TaxAmount,

      @Semantics.amount.currencyCode: 'Currency'
      gross_amount                     as GrossAmount,

      zz_received_date                 as ReceivedDate,
      pymnt_terms                      as PaymentTerms,

      case
        when pymnt_terms_text is not initial
        then pymnt_terms_text
        else _PaymentTermsText.PaymentTermsName
      end                              as PaymentTermsText,

      credit_memo                      as CreditMemo,
      due_date                         as DueDate,

      case
        when credit_memo is initial
         and due_date < $session.system_date
        then 'X'
        else ''
      end                              as IsDueDatePassed,

      bukrs                            as CompanyCode,
      gjahr                            as FiscalYear,
      belnr                            as AccountingDocument,
      budat                            as PostingDate,
      bldat                            as DocumentDate,

      archiv_id                        as ArchiveId,
      arc_doc_id                       as ArchiveDocId,

      case status
        when '06' then 1
        when '08' then 1
        when '10' then 1
        when '15' then 3
        when '16' then 1
        when '18' then 1
        when '02' then 2
        when '03' then 2
        else 0
      end                              as StatusCriticality,

      index_user                       as CreatedBy,

      @Semantics.systemDateTime.createdAt: true
      index_date                       as CreatedAt,

      change_user                      as LastChangedBy,

      @Semantics.systemDateTime.lastChangedAt: true
      change_date                      as LastChangedAt,

      // Associations
      _PaymentTermsText,
      _Supplier,

      // Compositions and Associations
      _Items,
      _GoodsReceipts,                  // <<< Custom entity
      _POItems                         // <<< Custom entity
}
