@EndUserText.label: 'VIM GR Reject Action Parameters'
define abstract entity ZS_ZFC_VIM_REJECT_PARAM
{
  VimDocumentId    : /opt/docid;
  RejectReasonCode : abap.char(2);   // ZZVIM_REJECTION_CODE domain
  RejectComment    : abap.string(0); // Free text rejection reason
}
