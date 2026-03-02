@EndUserText.label: 'VIM Goods Receipt - Custom Entity'
@ObjectModel.query.implementedBy: 'ABAP:ZCL_ZFC_VIM_GR_QUERY'
define custom entity ZC_ZFC_VIM_GR_CE
{
      @EndUserText.label: 'PO'
  key PurchaseOrder        : ebeln;

      @EndUserText.label: 'PO Item'
  key PurchaseOrderItem    : ebelp;

      @EndUserText.label: 'Sequence'
  key SequenceNumber       : dzekkn;

      @EndUserText.label: 'Transaction Type'
  key TransactionType      : vgabe;

      @EndUserText.label: 'Fiscal Year'
  key FiscalYear           : gjahr;

      @EndUserText.label: 'Material Document'
  key MaterialDocument     : mblnr;

      @EndUserText.label: 'Material Doc Item'
  key MaterialDocumentItem : mblpo;

      @EndUserText.label: 'VIM Document ID'
      VimDocumentId        : /opt/docid;

      @EndUserText.label: 'Select'
      SelectedGR           : abap_boolean;

      @EndUserText.label: 'Posting Date'
      PostingDate          : budat;

      @EndUserText.label: 'Entry Date'
      EntryDate            : cpudt;

      @Semantics.quantity.unitOfMeasure: 'Unit'
      @EndUserText.label: 'Quantity'
      Quantity             : menge_d;

      @Semantics.quantity.unitOfMeasure: 'Unit'
      @EndUserText.label: 'Quantity (PO Unit)'
      QuantityInPOUnit     : bpmng;

      @EndUserText.label: 'Unit'
      Unit                 : meins;

      @Semantics.quantity.unitOfMeasure: 'Unit'
      @EndUserText.label: 'Remaining Qty'
      RemainingQuantity    : menge_d;

      @Semantics.amount.currencyCode: 'Currency'
      @EndUserText.label: 'Amount (Local)'
      AmountInLocalCurrency : dmbtr;

      @Semantics.amount.currencyCode: 'Currency'
      @EndUserText.label: 'Amount'
      Amount               : wrbtr;

      @Semantics.amount.currencyCode: 'Currency'
      @EndUserText.label: 'Invoiced Amount'
      InvoicedAmount       : arewr;

      @EndUserText.label: 'Currency'
      Currency             : waers;

      @EndUserText.label: 'Tax Code'
      TaxCode              : mwskz;

      @EndUserText.label: 'Material'
      Material             : matnr;

      @EndUserText.label: 'Plant'
      Plant                : werks_d;

      @EndUserText.label: 'Storage Location'
      StorageLocation      : lgort_d;

      @EndUserText.label: 'Movement Type'
      MovementType         : bwart;

      @EndUserText.label: 'Debit/Credit'
      DebitCreditIndicator : shkzg;

      @EndUserText.label: 'Delivery Note'
      DeliveryNote         : lfbnr;

      @EndUserText.label: 'Reference Document'
      ReferenceDocument    : xblnr;

      @EndUserText.label: 'Movement Type Text'
      MovementTypeText     : abap.char( 20 );

      @EndUserText.label: 'Available for Matching'
      IsAvailableForMatching : abap_boolean;

      @Semantics.quantity.unitOfMeasure: 'Unit'
      @EndUserText.label: 'Credit Quantity'
      CreditQuantity       : menge_d;

      @Semantics.amount.currencyCode: 'Currency'
      @EndUserText.label: 'Unit Price'
      UnitPrice            : bprei;

      @EndUserText.label: 'Header Text'
      HeaderText           : abap.char( 25 );
}
