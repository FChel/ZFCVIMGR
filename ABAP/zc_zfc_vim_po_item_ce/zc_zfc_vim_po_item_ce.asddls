@EndUserText.label: 'VIM PO Item - Custom Entity'
@ObjectModel.query.implementedBy: 'ABAP:ZCL_ZFC_VIM_PO_ITEM_QUERY'
define custom entity ZC_ZFC_VIM_PO_ITEM_CE
{
      @EndUserText.label: 'PO'
  key PurchaseOrder          : ebeln;

      @EndUserText.label: 'PO Item'
  key PurchaseOrderItem      : ebelp;

      @EndUserText.label: 'Material'
      Material               : matnr;

      @EndUserText.label: 'Description'
      Description            : abap.char( 40 );

      @EndUserText.label: 'Plant'
      Plant                  : werks_d;

      @EndUserText.label: 'Storage Location'
      StorageLocation        : lgort_d;

      @EndUserText.label: 'Material Group'
      MaterialGroup          : matkl;

      @Semantics.quantity.unitOfMeasure: 'OrderUnit'
      @EndUserText.label: 'Order Quantity'
      OrderQuantity          : bstmg;

      @EndUserText.label: 'Unit'
      OrderUnit              : bstme;

      @Semantics.quantity.unitOfMeasure: 'OrderUnit'
      @EndUserText.label: 'Remaining Qty'
      RemainingQuantity      : bstmg;

      @Semantics.amount.currencyCode: 'Currency'
      @EndUserText.label: 'Net Price'
      NetPriceAmount         : bprei;

      @Semantics.amount.currencyCode: 'Currency'
      @EndUserText.label: 'Net Value'
      NetValue               : bwert;

      @EndUserText.label: 'Currency'
      Currency               : waers;

      @EndUserText.label: 'Tax Code'
      TaxCode                : mwskz;

      @EndUserText.label: 'GR-Based IV'
      GRBasedIV              : abap_boolean;

      @EndUserText.label: 'Invoice Expected'
      InvoiceIsExpected      : abap_boolean;

      @EndUserText.label: 'Company Code'
      CompanyCode            : bukrs;

      @EndUserText.label: 'Deletion Indicator'
      DeletionIndicator      : abap.char( 1 );

      @EndUserText.label: 'Item Category'
      PurchaseOrderItemCategory : abap.char( 1 );
}
