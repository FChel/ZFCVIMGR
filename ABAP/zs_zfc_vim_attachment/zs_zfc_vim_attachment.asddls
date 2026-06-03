@EndUserText.label: 'VIM Attachment Response'
// Abstract entity because it does not correspond to a persisted entity; simply carries the resolved attachment metadata back to the frontend.
define abstract entity ZS_ZFC_VIM_ATTACHMENT
{
  ArchiveUrl  : abap.string( 0 );
  MimeType    : abap.char( 128 );
  Filename    : abap.char( 255 );
}
