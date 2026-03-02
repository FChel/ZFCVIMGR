@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'VIM Document Item - Interface View'
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
    serviceQuality: #X,
    sizeCategory: #S,
    dataClass: #TRANSACTIONAL
}
define view entity ZI_ZFC_VIM_DOC_ITEM
  as select from /opt/vim_1item as VimDocItem
  
  association [0..1] to I_UnitOfMeasure as _UoM
    on  _UoM.UnitOfMeasure = VimDocItem.bstme  
  
  association to parent ZI_ZFC_VIM_DOC as _VimDocument
    on $projection.VimDocumentId = _VimDocument.VimDocumentId
    
{
  key docid                      as VimDocumentId,
  key itemid                     as VimDocumentItem,
      ebeln                      as PurchaseOrder,
      ebelp                      as PurchaseOrderItem,
      matnr                      as Material,
      maktx                      as Description,
                              
      _UoM.UnitOfMeasure  as Unit,  
      _UoM.UnitOfMeasureISOCode as UnitISOCode,
                    
      @Semantics.quantity.unitOfMeasure: 'Unit'
      @Semantics.quantity.unitOfMeasureIsoCode: 'UnitISOCode'
      menge                      as Quantity,
                 
      @Semantics.amount.currencyCode: 'Currency'
      wrbtr                      as Amount,
      cast (_VimDocument.Currency as waers)      as Currency,
      mwskz                      as TaxCode,
      hkont                      as GLAccount,
      kostl                      as CostCenter,
      
      
      _VimDocument.CompanyCode      as CompanyCode,
      
      /* Parent Association */
      _VimDocument
}
