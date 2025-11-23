import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static values = {
        obraId: {
            type: String,
            default: null
        }
    }

    static targets = ['clapsCountLabel'];

    connect() {
        this._obraId = this.obraIdValue;

        this._updateUI();
    }

    disconnect() {

    }

    async _updateUI() {
        try {
            const hasClaps = await this._getClaps();

            if (hasClaps) {
                this.element.setAttribute('value', hasClaps.clapsCount);
            }
            else {
                this.element.setAttribute('value', 0);
            }
        }
        catch (error) {

        }
    }

    async _getClaps() {
        try {
            const row = await window.db.claps.where('obraCode').equals(this._obraId).first();
            return row || null;
        }
        catch (error) {
            return null;
        }
    }

    async _setClaps(clapsCount) {
        try {
            await window.db.claps.put({ obraCode: this._obraId, clapsCount: clapsCount || 1 });
        }
        catch (error) {

        }
    }

    async addClap(event) {
        try {
            this._setClaps(event.target.value || 1);
        }
        catch (error) {

        }
        finally {
            this._updateUI();
        }
    }
}
