'use strict';

const { Thing, State } = require('abstract-things');
const { boolean } = require('abstract-things/values');

module.exports = Thing.mixin(Parent => class extends Parent.with(State) {
	static get capability() {
		return 'miio:switchable-led';
	}

	get serviceMapping() {
		return {
			led: { siid: 6, piid: 6}
		};
	}

	getServiceProperty(prop) {
		return {
			did: String(this.handle.api.id),
			siid: this.serviceMapping[prop].siid,
			piid: this.serviceMapping[prop].piid
		};
	}

	static availableAPI(builder) {
		builder.action('led')
			.description('Get or set if the LED should be used')
			.argument('boolean', true, 'If provided, set the LED power to this value')
			.returns('boolean', 'If the LED is on')
			.done();
	}

	propertyUpdated(key, value) {
		if(key === 'led') {
			this.updateState('led', value);
		}

		super.propertyUpdated(key, value);
	}

	/**
	 * Get or set if the LED should be on.
	 *
	 * @param {boolean} power Optional power to set LED to
	 */
	led(power) {
		if(typeof power === 'undefined') {
			return this.getState('led');
		}
		const attributes = [];
		attributes.push(Object.assign({ value: power }, this.getServiceProperty('led')));
		return this.changeLED(attributes)
			.then(() => this.getState('led'));
	}

	// /**
	//  * Set if the LED should be on when the device is running.
	//  */
	changeLED(attributes) {
		return this.call('set_properties', attributes, { refresh: [ 'led' ], refreshDelay: 200})
		.then(() => null);
	}
});
