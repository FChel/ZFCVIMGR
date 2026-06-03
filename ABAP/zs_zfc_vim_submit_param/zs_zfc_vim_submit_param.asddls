@EndUserText.label: 'VIM GR Submit Action Parameters'
define abstract entity ZS_ZFC_VIM_SUBMIT_PARAM
{
  VimDocumentId  : /opt/docid;
  SelectedGRJson : abap.string(0);   // JSON array of selected GR rows
  LateReasonCode : abap.char(2);     // ZZVIM_LATE_REASON_CODE domain
  LateComment    : abap.string(0);   // Free text late explanation
}
