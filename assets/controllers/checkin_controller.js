import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static values = {
        locationId: {
            type: String,
            default: null
        },
        statusLabel: {
            type: String,
            default: 'Checked In'
        }
    }

    static targets = ['button', 'buttonIcon', 'buttonLabel', 'statusIcon', 'statusLabel'];

    connect() {
        this._locationId = this.locationIdValue;

        this._icons = {
            SolarMapPointAddOutline: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" fill-rule="evenodd" d="M3.25 10.143C3.25 5.244 7.155 1.25 12 1.25s8.75 3.994 8.75 8.893c0 2.365-.674 4.905-1.866 7.099c-1.19 2.191-2.928 4.095-5.103 5.112a4.2 4.2 0 0 1-3.562 0c-2.175-1.017-3.913-2.92-5.103-5.112c-1.192-2.194-1.866-4.734-1.866-7.099M12 2.75c-3.992 0-7.25 3.297-7.25 7.393c0 2.097.603 4.392 1.684 6.383c1.082 1.993 2.612 3.624 4.42 4.469a2.7 2.7 0 0 0 2.291 0c1.809-.845 3.339-2.476 4.421-4.469c1.081-1.99 1.684-4.286 1.684-6.383c0-4.096-3.258-7.393-7.25-7.393m0 4a.75.75 0 0 1 .75.75v1.75h1.75a.75.75 0 0 1 0 1.5h-1.75v1.75a.75.75 0 0 1-1.5 0v-1.75H9.5a.75.75 0 0 1 0-1.5h1.75V7.5a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/></svg>',
            SolarCheckCircleOutline: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.03 10.03a.75.75 0 1 0-1.06-1.06l-4.47 4.47l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0z"/><path fill="currentColor" fill-rule="evenodd" d="M12 1.25C6.063 1.25 1.25 6.063 1.25 12S6.063 22.75 12 22.75S22.75 17.937 22.75 12S17.937 1.25 12 1.25M2.75 12a9.25 9.25 0 1 1 18.5 0a9.25 9.25 0 0 1-18.5 0" clip-rule="evenodd"/></svg>'
        };

        this._updateUI();

        document.addEventListener('page:afterin', this._updateUI);
    }

    disconnect() {
        document.removeEventListener('page:afterin', this._updateUI);
    }

    _updateUI = async () => {
        try {
            const hasCheckedIn = await this._getCheckIn();

            if (hasCheckedIn) {
                if (this.hasButtonTarget) {
                    this.buttonTarget.classList.remove('button-fill');
                    this.buttonTarget.classList.add('button-tonal');
                    this.buttonTarget.classList.add('color-green');
                }

                if (this.hasButtonIconTarget) {
                    this.buttonIconTarget.innerHTML = this._icons.SolarCheckCircleOutline;
                }

                if (this.hasButtonLabelTarget) {
                    this.buttonLabelTarget.textContent = 'Checked In';
                }

                if (this.hasStatusIconTarget) {
                    this.statusIconTarget.innerHTML = this._icons.SolarCheckCircleOutline;
                    this.statusIconTarget.style.visibility = 'visible';
                }

                if (this.hasStatusLabelTarget) {
                    this.statusLabelTarget.textContent = this.statusLabelValue;
                    this.statusLabelTarget.style.visibility = 'visible';
                }
            }
            else {
                if (this.hasButtonTarget) {
                    this.buttonTarget.classList.remove('button-tonal');
                    this.buttonTarget.classList.add('button-fill');
                    this.buttonTarget.classList.add('color-primary');
                }

                if (this.hasButtonIconTarget) {
                    this.buttonIconTarget.innerHTML = this._icons.SolarMapPointAddOutline;
                }

                if (this.hasButtonLabelTarget) {
                    this.buttonLabelTarget.textContent = 'Check In';
                }

                if (this.hasStatusIconTarget) {
                    this.statusIconTarget.innerHTML = '';
                    this.statusIconTarget.style.visibility = 'hidden';
                }

                if (this.hasStatusLabelTarget) {
                    this.statusLabelTarget.textContent = '';
                    this.statusLabelTarget.style.visibility = 'hidden';
                }
            }
        }
        catch (error) {

        }
    }

    async _getCheckIn() {
        try {
            const row = await window.db.checkins.where('locationCode').equals(this._locationId).first();
            return row || null;
        }
        catch (error) {
            return null;
        }
    }

    async _setCheckIn() {
        try {
            await window.db.checkins.put({ locationCode: this._locationId, timestamp: new Date().toISOString() });
        }
        catch (error) {

        }
    }

    async checkIn() {
        try {
            const hasCheckedIn = await this._getCheckIn();

            if (!hasCheckedIn) {
                await this._setCheckIn();
                return;
            }

            const localeString = new Date(hasCheckedIn.timestamp).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });

            app.toast.show({
                text: `You visited here on ${localeString}`,
                cssClass: 'dark',
                closeTimeout: 5000
            });
        }
        catch (error) {

        }
        finally {
            this._updateUI();
        }
    }
}
