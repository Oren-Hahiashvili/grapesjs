import { View } from 'backbone';

export default View.extend({
  events: {
    click: 'active',
    'click [data-close-layer]': 'removeItem',
    'mousedown [data-move-layer]': 'initSorter',
    'touchstart [data-move-layer]': 'initSorter',
  },

  template() {
    const { pfx, ppfx } = this;

    return `
      <div id="${pfx}move" class="${ppfx}no-touch-actions" data-move-layer>
        <i class="fa fa-arrows"></i>
      </div>
      <div id="${pfx}label" data-label></div>
      <div id="${pfx}preview-box">
      	<div id="${pfx}preview" data-preview></div>
      </div>
      <div id="${pfx}close-layer" class="${pfx}btn-close" data-close-layer>
        &Cross;
      </div>
      <div id="${pfx}inputs" data-properties></div>
      <div style="clear:both"></div>
    `;
  },

  initialize(o = {}) {
    const { model } = this;
    this.stackModel = o.stackModel;
    this.propertyView = o.propertyView;
    this.config = o.config || {};
    this.em = this.config.em;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.sorter = o.sorter || null;
    this.propsConfig = o.propsConfig || {};
    this.pModel = this.propertyView.model;
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change:active', this.updateVisibility);
    this.listenTo(model, 'change:values', this.updateLabel);

    // For the sorter
    model.view = this;
    model.set({ droppable: 0, draggable: 1 });
    this.$el.data('model', model);
  },

  /**
   * Delegate sorting
   * @param  {Event} e
   * */
  initSorter(e) {
    if (this.sorter) this.sorter.startSort(this.el);
  },

  removeItem(ev) {
    ev && ev.stopPropagation();
    this.remove();
  },

  remove() {
    this.pModel.removeLayer(this.model);
    View.prototype.remove.apply(this, arguments);
  },

  getPropertiesWrapper() {
    if (!this.propsWrapEl) {
      this.propsWrapEl = this.el.querySelector('[data-properties]');
    }
    return this.propsWrapEl;
  },

  getPreviewEl() {
    if (!this.previewEl) {
      this.previewEl = this.el.querySelector('[data-preview]');
    }
    return this.previewEl;
  },

  getLabelEl() {
    if (!this.labelEl) {
      this.labelEl = this.el.querySelector('[data-label]');
    }
    return this.labelEl;
  },

  active() {
    const { model, propertyView } = this;
    const pm = propertyView.model;
    if (pm.getSelectedLayer() === model) return;
    pm.selectLayer(model);
    model.collection.active(model.getIndex());
  },

  updateVisibility() {
    const { pfx, model, propertyView } = this;
    const wrapEl = this.getPropertiesWrapper();
    const active = model.get('active');
    wrapEl.style.display = active ? '' : 'none';
    this.$el[active ? 'addClass' : 'removeClass'](`${pfx}active`);
    active && wrapEl.appendChild(propertyView.props.el);
  },

  updateLabel() {
    const { model, propertyView } = this;
    const label = propertyView.model.getLayerLabel(model);
    this.getLabelEl().innerHTML = label;
  },

  render() {
    const { model, el, pfx } = this;
    const preview = model.get('preview');
    el.innerHTML = this.template();
    el.className = `${pfx}layer${!preview ? ` ${pfx}no-preview` : ''}`;
    this.updateLabel();
    this.updateVisibility();
    return this;
  },
});
