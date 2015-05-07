/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'underscore',
    'mageUtils',
    'Magento_Ui/js/lib/collapsible'
], function (_, utils, Collapsible) {
    'use strict';

    function extractPreview(elem) {
        return {
            label: elem.label,
            preview: elem.getPreview(),
            elem: elem
        };
    }

    function removeEmpty(data) {
        data = utils.flatten(data);

        data = _.omit(data, function (value, key) {
            return value === '' || typeof value === 'undefined';
        });

        return utils.unflatten(data);
    }

    return Collapsible.extend({
        defaults: {
            template: 'ui/grid/filters/filters',
            applied: {},
            states: {
                namespace: 'current.filters'
            },
            listens: {
                active: 'extractPreviews',
                applied: 'cancel extractActive'
            },
            links: {
                applied: '<%= states.provider %>:<%= states.namespace %>'
            },
            exports: {
                applied: '<%= provider %>:params.filters'
            },
            modules: {
                source: '<%= provider %>',
                statesProvider: '<%= states.provider %>'
            }
        },

        initialize: function () {
            this._super()
                .cancel()
                .extractActive();

            return;
        },

        /**
         * Initializes observable properties.
         *
         * @returns {Filters} Chainable.
         */
        initObservable: function () {
            this._super()
                .observe({
                    active: [],
                    previews: []
                });

            return this;
        },

        /**
         * Called when another element was added to current component.
         *
         * @returns {Filters} Chainable.
         */
        initElement: function () {
            this._super()
                .extractActive();

            return this;
        },

        /**
         * Clears filters data.
         *
         * @param {Object} [filter] - If provided, then only specified filter will be cleared.
         *      Otherwise, clears all data.
         *
         * @returns {Filters} Chainable.
         */
        clear: function (filter) {
            filter ?
                filter.clear() :
                this.active.each('clear');

            this.apply();

            return this;
        },

        /**
         * Sets filters data to the applied state.
         *
         * @returns {Filters} Chainable.
         */
        apply: function () {
            this.set('applied', removeEmpty(this.filters));

            return this;
        },

        /**
         * Resets filters to the last applied state.
         *
         * @returns {Filters} Chainable.
         */
        cancel: function () {
            this.set('filters', utils.copy(this.applied));

            return this;
        },

        /**
         * Tells wether filters pannel should be opened.
         *
         * @returns {Boolean}
         */
        isOpened: function () {
            return this.opened() && this.hasVisible();
        },

        /**
         * Tells wether specified filter should be visible.
         *
         * @param {Object} filter
         * @returns {Boolean}
         */
        isFilterVisible: function (filter) {
            return filter.visible() || this.isFilterActive(filter);
        },

        /**
         * Checks if specified filter is active.
         *
         * @param {Object} filter
         * @returns {Boolean}
         */
        isFilterActive: function (filter) {
            return this.active.contains(filter);
        },

        /**
         * Checks if collection has visible filters.
         *
         * @returns {Boolean}
         */
        hasVisible: function () {
            return this.elems.some(this.isFilterVisible, this);
        },

        extractActive: function () {
            this.active(this.elems.filter('hasData'));

            return this;
        },

        extractPreviews: function (elems) {
            var previews = elems.map(extractPreview);

            this.previews(_.compact(previews));

            return this;
        }
    });
});
