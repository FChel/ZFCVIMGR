@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'VIM Document Search Help View'
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.usageType:{
    serviceQuality: #A,
    sizeCategory: #L,
    dataClass: #TRANSACTIONAL
}
define view entity ZI_ZFC_VIM_DOC_SH
  as select from /opt/vim_1head as vim
  left outer join lfa1 as vendor
    on vendor.lifnr = vim.lifnr
  left outer join /opt/vim_t101t as stat
    on  stat.statusid = vim.status
    and stat.spras    = $session.system_language
{
  key vim.docid        as VIM_Doc_Id,
      vim.ebeln        as PO_Number,
      vim.lifnr        as Vendor,
      vim.vend_name    as Vendor_Name,
      vendor.mcod1     as Vendor_Name_M_C,
      
      vim.waers        as Currency,
      @Semantics.amount.currencyCode: 'Currency'
      vim.gross_amount as GrossAmount,
      
      vim.status       as Status,
      stat.objtxt      as StatusText
}
