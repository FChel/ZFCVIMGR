@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'VIM Document Item - Consumption View'
@Metadata.allowExtensions: true
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
    serviceQuality: #X,
    sizeCategory: #S,
    dataClass: #TRANSACTIONAL
}

define view entity ZC_ZFC_VIM_DOC_ITEM
  as projection on ZI_ZFC_VIM_DOC_ITEM
{
  @EndUserText.label: 'VIM Document ID'
  key VimDocumentId,
  @EndUserText.label: 'VIM Document Item'
  key VimDocumentItem,
      @EndUserText.label: 'Purchase Order'
      PurchaseOrder,
      @EndUserText.label: 'Purchase Order Item'
      PurchaseOrderItem,
      @EndUserText.label: 'Material'
      Material,
      @EndUserText.label: 'Description'
      Description,
      @Semantics.quantity.unitOfMeasure: 'Unit'
      @EndUserText.label: 'Quantity'
      Quantity,
      @EndUserText.label: 'Unit'
      Unit,
      @Semantics.amount.currencyCode: 'Currency'
      @EndUserText.label: 'Amount'
      Amount,
      @EndUserText.label: 'Currency'
      Currency,
      @EndUserText.label: 'Tax Code'
      TaxCode,
      @EndUserText.label: 'G/L Account'
      GLAccount,
      @EndUserText.label: 'Cost Center'
      CostCenter,
      
      @EndUserText.label: 'Company Code'
      CompanyCode,
      
      /* Parent Association - redirected to consumption parent */
      _VimDocument : redirected to parent ZC_ZFC_VIM_DOC
}
