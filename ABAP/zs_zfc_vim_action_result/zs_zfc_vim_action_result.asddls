@EndUserText.label: 'VIM GR Action Result'
define abstract entity ZS_ZFC_VIM_ACTION_RESULT
{
  VimDocumentId : /opt/docid;
  Success       : abap_boolean;
  MessageText   : abap.string(0);
}
