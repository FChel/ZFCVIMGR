@EndUserText.label: 'VIM Document Value Help'
@ObjectModel.query.implementedBy: 'ABAP:ZCL_ZFC_VIM_DOC_VH_QUERY'
define custom entity ZC_ZFC_VIM_DOC_VH_CE
{
      @EndUserText.label: 'VIM Document ID'
  key VimDocumentId    : abap.char(12);

      @EndUserText.label: 'Purchase Order'
      PurchaseOrder    : abap.char(10);

      @EndUserText.label: 'Vendor'
      Vendor           : abap.char(10);

      @EndUserText.label: 'Vendor Name'
      VendorName       : abap.char( 35 );

      @EndUserText.label: 'Gross Amount'
      @Semantics.amount.currencyCode: 'Currency'
      GrossAmount      : abap.curr( 15, 2 );

      @EndUserText.label: 'Currency'
      Currency         : waers;

      @EndUserText.label: 'Status'
      ProcessStatus    : abap.char( 2 );

      @EndUserText.label: 'Status Text'
      ProcessStatusText : abap.char( 60 );
}
