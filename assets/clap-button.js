const template = document.createElement('template');

template.innerHTML = `
<style>
    :host {
        --clap-accent-color: #02B875;
        --clap-accent-color-rgb: 2, 184, 117;
        user-select: none;
    }
    .wrapper {
        align-items: center;
        display: inline-flex;
        gap: 12px;
    }
    .button {
        background: var(--clap-button-bg-color, #FFFFFF);
        border: var(--clap-button-border-width, 1px) solid var(--clap-button-border-color, rgba(var(--clap-accent-color-rgb), var(--clap-button-border-opacity, 1)));
        border-radius: 50%;
        box-shadow: var(--clap-button-shadow, none);
        box-sizing: border-box;
        cursor: pointer;
        display: grid;
        height: var(--clap-button-size, 48px);
        outline: none;
        padding: 0;
        place-items: center;
        position: relative;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
        width: var(--clap-button-size, 48px);
    }
    .button:active {
        transform: scale(0.96);
    }
    .button[disabled] {
        cursor: not-allowed;
        opacity: 0.5;
    }
    ::slotted([slot='icon']) {
        color: var(--clap-icon-color, var(--clap-accent-color));
        font-size: 1.5rem;
        height: 1.5rem;
        line-height: 1;
        pointer-events: none;
        transition: transform 0.18s ease;
        width: 1.5rem;
    }
    ::slotted([slot='icon']) > svg {
        fill: var(--clap-icon-color, var(--clap-accent-color, currentColor));
        height: 100%;
        width: 100%;
    }
    .ring {
        border-radius: 50%;
        box-shadow: 0 0 0 0 rgba(var(--clap-accent-color-rgb), 0.25);
        inset: 0;
        opacity: 0;
        position: absolute;
    }
    .burst {
        height: var(--clap-burst-size, 80px);
        inset: calc((var(--clap-button-size, 48px) - var(--clap-burst-size, 80px)) / 2);
        pointer-events: none;
        position: absolute;
        width: var(--clap-burst-size, 80px);
    }
    .burst i {
        background: var(--clap-accent-color);
        border-radius: 2px;
        height: 12px;
        left: 50%;
        opacity: 0;
        position: absolute;
        top: 50%;
        transform-origin: 50% 100%;
        width: 4px;
    }
    .counter {
        align-items: center;
        background: var(--clap-counter-bg-color, #FFFFFF);
        border: var(--clap-counter-border-width, 1px) solid var(--clap-counter-border-color, rgba(var(--clap-accent-color-rgb), var(--clap-counter-border-opacity, 1)));
        border-radius: 999px;
        box-shadow: var(--clap-counter-shadow, none);
        color: var(--clap-counter-text-color, inherit);
        display: inline-flex;
        font-size: var(--clap-counter-font-size, 12px);
        gap: 4px;
        padding: 4px 12px;
        position: relative;
    }
    .delta {
        font-size: 12px;
        font-weight: 500;
        left: -12px;
        opacity: 0;
        position: absolute;
        top: -24px;
        transform: translateY(6px);
    }

    @keyframes pop {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.12);
        }
        100% {
            transform: scale(1);
        }
    }
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(var(--clap-accent-color-rgb), 0.35);
            opacity: 1;
        }
        100% {
            box-shadow: 0 0 0 18px rgba(var(--clap-accent-color-rgb), 0);
            opacity: 0;
        }
    }
    @keyframes floatUp {
        0% {
            opacity: 0;
            transform: translateY(6px);
        }
        20% {
            opacity: 1;
        }
        100% {
            opacity: 0;
            transform: translateY(-18px);
        }
    }
    @keyframes ray {
        0% {
            opacity: 0;
            transform: rotate(var(--rotation)) translateY(0) scale(0.8);
        }
        60% {
            opacity: 1;
        }
        100% {
            opacity: 0;
            transform: rotate(var(--rotation)) translateY(-18px) scale(1);
        }
    }
    @keyframes confetti {
        0% {
            opacity: 0;
            transform: rotate(var(--rotation)) translateY(0) scale(0.8);
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0;
            transform: rotate(calc(var(--rotation) + 8deg)) translateY(-24px) scale(1);
        }
    }

    .button.pop {
        animation: pop 0.22s ease;
    }

    .ring.pulse {
        animation: pulse 0.5s ease;
    }

    .delta.show {
        animation: floatUp 0.6s ease forwards;
    }

    .burst .ray {
        animation: ray 0.5s ease forwards;
    }

    .burst .dot {
        animation: confetti 0.7s ease forwards;
        border-radius: 50%;
        height: 4px;
        width: 4px;
    }

    @media (prefers-reduced-motion: reduce) {
        .button.pop, .ring.pulse, .delta.show, .burst .ray, .burst .dot {
            animation: none;
        }
    }
</style>

<div class="wrapper">
    <button class="button" part="button" aria-live="polite">
        <span class="ring"></span>
        <slot name="icon">👏</slot>
        <div class="burst" aria-hidden="true"></div>
    </button>
    <div class="counter">
        <span class="delta" aria-hidden="true">+1</span>
        <slot name="count"></slot>
        <slot name="label"></slot>
    </div>
</div>
`;

export class ClapButton extends HTMLElement {
    static get observedAttributes() {
        return ['disabled', 'max', 'step', 'value'];
    }

    constructor() {
        super();

        this.attachShadow({
            mode: 'open'
        });

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.$button = this.shadowRoot.querySelector('.button');
        this.$delta = this.shadowRoot.querySelector('.delta');
        this.$ring = this.shadowRoot.querySelector('.ring');
        this.$burst = this.shadowRoot.querySelector('.burst');

        this._makeBurst();

        this._holding = false;
        this._holdTimer = null;
        this._tick = null;
        this._interval = 160;

        this.$button.setAttribute('role', 'button');
        this.$button.setAttribute('aria-pressed', 'false');
        this.$button.setAttribute('aria-label', 'Clap');

        this._onClick = this._onClick.bind(this);
        this._onKey = this._onKey.bind(this);
        this._onDown = this._onDown.bind(this);
        this._onUp = this._onUp.bind(this);
    }

    connectedCallback() {
        this.$button.addEventListener('click', this._onClick);
        this.$button.addEventListener('keydown', this._onKey);
        this.$button.addEventListener('mousedown', this._onDown);
        this.$button.addEventListener('touchstart', this._onDown, { passive:true });
        window.addEventListener('mouseup', this._onUp);
        window.addEventListener('touchend', this._onUp);
        this._render();
    }

    disconnectedCallback() {
        this.$button.removeEventListener('click', this._onClick);
        this.$button.removeEventListener('keydown', this._onKey);
        this.$button.removeEventListener('mousedown', this._onDown);
        this.$button.removeEventListener('touchstart', this._onDown, { passive:true });
        window.removeEventListener('mouseup', this._onUp);
        window.removeEventListener('touchend', this._onUp);
        this._stopHold();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) {
            return;
        }

        switch (name) {
            case 'disabled':
                this.$button.toggleAttribute('disabled', this.disabled);
            break;

            case 'value':
                this.value = Math.max(0, Math.min(Math.floor(Number(newVal) || 0), this.max));
            break;

            case 'max':
                let max = Math.floor(Number(newVal) || 0);
                if (max <= 0) {
                    max = Infinity;
                }
            break;

            case 'step':
                let step = Math.floor(Number(newVal) || 1);
                if (step <= 0 || (this.max !== Infinity && (step > this.max || this.max % step !== 0))) {
                    step = 1;
                }
            break;
        }

        this._render();
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }
    set disabled(val) {
        val ? this.setAttribute('disabled', '') : this.removeAttribute('disabled');
    }

    get max() {
        const attr = this.getAttribute('max');
        if (attr === null) {
            return Infinity;
        }
        const max = Number(attr);
        if (!Number.isInteger(max) || max <= 0) {
            return Infinity;
        }
        return max;
    }
    set max(val) {
        let max = Number(val);
        if (!Number.isInteger(max) || max <= 0) {
            this.removeAttribute('max');
            return;
        }
        this.setAttribute('max', String(max));
    }

    get step() {
        const attr = this.getAttribute('step');
        if (attr === null) {
            return 1;
        }
        const step = Number(attr);
        if (!Number.isInteger(step) || step <= 0) {
            return 1;
        }
        const max = this.max;
        if (max === Infinity) {
            return step;
        }
        if (step > max) {
            return 1;
        }
        if (max % step !== 0) {
            return 1;
        }
        return step;
    }
    set step(val) {
        let step = Number(val);
        if (!Number.isInteger(step) || step <= 0) {
            this.setAttribute('step', '1');
            return;
        }
        const max = this.max;
        if (max !== Infinity) {
            if (step > max || max % step !== 0) {
                this.setAttribute('step', '1');
                return;
            }
        }
        this.setAttribute('step', String(step));
    }

    get value() {
        return this._value ?? 0;
    }
    set value(val) {
        let value = Number(val);
        if (!Number.isInteger(value) || value < 0) {
            value = 0;
        }
        const max = this.max;
        const step = this.step;
        if (value > max) {
            value = max;
        }
        if (step > 1 && max !== Infinity) {
            value = Math.round(value / step) * step;
        }
        this._value = value;
        this.setAttribute('value', String(value));
        this._render();
    }

    _onClick(event) {
        event.preventDefault();
        this._clapOnce();
    }
    _onKey(event) {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this._clapOnce();
        }
    }
    _onDown(event) {
        if (this.disabled) {
            return;
        }
        if (event.button !== 0) {
            return;
        }
        this._holding = true;
        this._holdTimer = setTimeout(() => {
            this._startHold();
        }, 450);
    }
    _onUp() {
        this._holding = false;
        this._stopHold();
    }

    _startHold() {
        if (!this._holding) {
            return;
        }
        let step = 0;
        const run = () => {
            this._clapOnce();
            step++;
            const next = Math.max(60, this._interval - step * 6);
            this._tick = setTimeout(run, next);
        };
        run();
    }

    _stopHold() {
        clearTimeout(this._holdTimer);
        clearTimeout(this._tick);
        this._holdTimer = null;
        this._tick = null;
    }

    _clapOnce() {
        if (this.disabled) {
            return;
        }
        const step = this.step;
        const max = this.max;
        const newValue = Math.min(this.value + step, max);
        if (this.value === max) {
            this._animate();
            return;
        }
        this.value = newValue;
        this._animate();
        this._emit();
        this._render();
    }

    _emit() {
        this.dispatchEvent(
            new CustomEvent('clap', {
                detail: {
                    max: this.max,
                    step: this.step,
                    value: this.value
                },
                bubbles: true
            })
        );
    }

    _render() {
        const countSlot = this.shadowRoot.querySelector('slot[name="count"]');
        countSlot.assignedElements().forEach(element =>
            element.textContent = this.value.toLocaleString()
        );

        const labelSlot = this.shadowRoot.querySelector('slot[name="label"]');
        let labelText = labelSlot.assignedNodes()[0]?.textContent.trim() || "Claps";

        this.$button.setAttribute('aria-pressed', this.value > 0 ? 'true' : 'false');
        this.$button.setAttribute('aria-label', `Clap. Your Claps: ${this.value}. Max ${this.max}.`);
    }

    _animate() {
        this.$button.classList.remove('pop');
        this.$ring.classList.remove('pulse');
        void this.$button.offsetWidth;
        this.$button.classList.add('pop');
        this.$ring.classList.add('pulse');

        this.$delta.textContent = `+${this.step}`;
        this.$delta.classList.remove('show');
        void this.$delta.offsetWidth;
        this.$delta.classList.add('show');

        const items = this.$burst.querySelectorAll('i');
        items.forEach((element, index) => {
            element.classList.remove('ray', 'dot');
            void element.offsetWidth;
            const rotation = 360 / items.length * index;
            element.style.setProperty('--rotation', `${rotation}deg`);
            element.classList.add(index % 2 === 0 ? 'ray' : 'dot');
        });
    }

    _makeBurst() {
        const N = 12;
        this.$burst.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < N; i++) {
            const element = document.createElement('i');
            element.style.setProperty('--rotation', `${i * (360 / N)}deg`);
            fragment.appendChild(element);
        }
        this.$burst.appendChild(fragment);
    }
}

customElements.define('clap-button', ClapButton);
