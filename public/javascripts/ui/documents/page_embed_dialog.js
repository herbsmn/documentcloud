dc.ui.PageEmbedDialog = dc.ui.Dialog.extend({

  events : {
    'change select'         : 'update',
    'click select'          : 'update',
    'click .next'           : 'nextStep',
    'click .previous'       : 'previousStep',
    'click .close'          : 'close',
    'click .snippet'        : 'selectSnippet',
    'click .set_publish_at' : 'openPublishAtDialog',
    'click .edit_access'    : 'editAccessLevel',
    'click .remove_lines'   : 'removeLines'
  },

  totalSteps : 2,

  STEPS : [null,
    'Select a page to embed', // TODO: Tranlsation
    'Copy and paste embed code' // TODO: Translation
  ],

  DEMO_ERROR : _.t('embed_note_demo_error','<a href="/contact">','</a>','<a href="/help/publishing#step_5">','</a>'),

  DEFAULT_OPTIONS : {},

  constructor : function(doc) {
    this.currentStep   = 1;
    this.doc           = doc;
    this.height        = 0;
    dc.ui.spinner.show();
    dc.ui.Dialog.call(this, {mode : 'custom', title : this.displayTitle()});
    this.render();
  },

  render : function() {
    if (dc.account.organization().get('demo')) return dc.ui.Dialog.alert(this.DEMO_ERROR);
    dc.ui.Dialog.prototype.render.call(this);
    this.$('.custom').html(JST['workspace/page_embed_dialog']({
      doc       : this.doc,
      pageCount : this.doc.get('page_count')
    }));
    this._next          = this.$('.next');
    this._previous      = this.$('.previous');
    this._pageSelectEl  = this.$('select[name=page]');
    this._preview       = this.$('.page_preview');
    this.setMode('embed', 'dialog');
    this.setMode('page_embed', 'dialog');
    this.update();
    this.setStep();
    this.center();
    dc.ui.spinner.hide();
    return this;
  },

  displayTitle : function() {
    return this.STEPS[this.currentStep];
  },

  update : function() {
    this._selectedPage = parseInt(this._pageSelectEl.val(), 10);
    this._renderPage();
    this._renderEmbedCode();
    if (this._preview.height() > this.height) {
      this.center();
      this.height = this._preview.height();
    }
  },

  // Remove line breaks from the viewer embed.
  removeLines : function() {
    var $html_snippet = this.$('#page_embed_html_snippet');
    $html_snippet.val($html_snippet.val().replace(/[\r\n]/g, ''));
  },

  _renderPage : function() {
    console.log(this._selectedPage);
    // var noteView = new dc.ui.Note({
    //   model         : this.note,
    //   collection    : this.doc.notes,
    //   disableLinks  : true
    // });
    // this.$('.note_preview').html(noteView.render().el);
    // noteView.center();
  },

  embedOptions : function() {
    var options = {};
    return options;
  },

  _renderEmbedCode : function() {
    var options = this.embedOptions();
    this.$('.publish_embed_code').html(JST['workspace/page_embed_code']({
      doc:              this.doc,
      pageNumber:       this._selectedPage,
      permalink:        this._pagePermalink(),
      pageImageUrl:     this._pageImageUrl(),
      options:          _.map(options, function(value, key){ return key + ': ' + value; }).join(',\n    '),
      shortcodeOptions: options ? ' ' + _.map(options, function(value, key) { return key + '=' + (typeof value == 'string' ? value.replace(/\"/g, '&quot;') : value); }).join(' ') : '',
    }));
  },

  _pagePermalink: function() {
    return this.doc.get('document_viewer_url') + '#document/p' + this._selectedPage;
  },

  _pageImageUrl: function() {
    return this.doc.get('page_image_url').replace('{page}', this._selectedPage).replace('{size}', 'normal');
  },

  nextStep : function() {
    this.currentStep += 1;
    if (this.currentStep > this.totalSteps) return this.close();
    if (this.currentStep == 2) this.update();
    this.setStep();
  },

  previousStep : function() {
    if (this.currentStep > 1) this.currentStep -= 1;
    this.setStep();
  },

  setStep : function() {
    this.title(this.displayTitle());

    this.$('.publish_step').setMode('not', 'enabled');
    this.$('.publish_step_'+this.currentStep).setMode('is', 'enabled');
    this.info( _.t('step_x_of_x', this.currentStep, this.totalSteps), true);

    var first = this.currentStep == 1;
    var last = this.currentStep == this.totalSteps;

    this._previous.setMode(first ? 'not' : 'is', 'enabled');
    this._next.html(last ? _.t('finish') : _.t('next') + ' &raquo;').setMode('is', 'enabled');
  },

  selectSnippet : function(e) {
    this.$(e.target).closest('.snippet').select();
  },

  // If necessary, let the user change the document's access level before embedding.
  editAccessLevel : function() {
    this.close();
    Documents.editAccess([this.doc]);
  },

  // Optionally, set a document `publish_at` time by opening a new dialog.
  openPublishAtDialog : function() {
    this.close();
    new dc.ui.PublicationDateDialog([this.doc]);
  }

});
