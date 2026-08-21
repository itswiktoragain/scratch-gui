import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import log from '../lib/log';

import extensionLibraryContent from '../lib/libraries/extensions/index.jsx';
import extensionTags from '../lib/libraries/tw-extension-tags';

import LibraryComponent from '../components/library/library.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';

const EXTENSION_GALLERY_BASE = 'https://itswiktoragain.github.io/extensions-well-thats-quite-new/';
const GALLERY_CACHE_KEY = 'dry-eggs-extension-metadata-v1';
const GALLERY_TIMEOUT = 8000;

const DRY_EGGS_PICKS = new Set([
    'clipboard',
    'files',
    'gamepad',
    'local-storage',
    'runtime-options',
    'pointerlock',
    'stretch',
    'encoding',
    'text',
    'battery',
    'fetch',
    'bitwise'
]);

const nativeDryEggsUtilities = {
    name: 'Dry Eggs Utilities',
    extensionId: 'dryEggs',
    iconURL: extensionIcon,
    description: 'Built-in clipboard, storage, browser, UUID, time, URL, and device utility blocks. Works without downloading extension JavaScript.',
    tags: ['tw'],
    incompatibleWithScratch: true,
    featured: true
};

const messages = defineMessages({
    extensionTitle: {
        defaultMessage: 'Dry Eggs Extension Library',
        description: 'Heading for the extension library',
        id: 'gui.extensionLibrary.chooseAnExtension'
    }
});

const galleryLoading = {
    name: 'Dry Eggs Extension Library',
    href: EXTENSION_GALLERY_BASE,
    extensionId: 'gallery',
    iconURL: extensionIcon,
    description: 'Loading the Dry Eggs extension library…',
    tags: ['tw'],
    featured: true
};

const galleryMore = {
    name: 'Open the full Dry Eggs library',
    href: EXTENSION_GALLERY_BASE,
    extensionId: 'gallery',
    iconURL: extensionIcon,
    description: 'Browse every extension, documentation page, and sample project.',
    tags: ['tw'],
    featured: true
};

const galleryError = {
    name: 'Extension library is temporarily offline',
    href: EXTENSION_GALLERY_BASE,
    extensionId: 'gallery',
    iconURL: extensionIcon,
    description: 'Built-in extensions are still available. Open the Dry Eggs library site to retry.',
    tags: ['tw'],
    featured: true
};

const toLibraryItem = extension => {
    if (typeof extension === 'object') {
        const item = {
            rawURL: extension.iconURL || extensionIcon,
            ...extension
        };

        if (item.extensionId === 'faceSensing') {
            item.extensionURL = `${EXTENSION_GALLERY_BASE}lab/face-sensing.js`;
        }
        return item;
    }
    return extension;
};

const translateGalleryItem = (extension, locale) => ({
    ...extension,
    name: extension.nameTranslations[locale] || extension.name,
    description: extension.descriptionTranslations[locale] || extension.description
});

const mapMetadataToLibrary = data => {
    if (!data || !Array.isArray(data.extensions)) {
        throw new Error('Dry Eggs extension metadata is missing the extensions array');
    }
    return data.extensions.map(extension => ({
        name: extension.name,
        nameTranslations: extension.nameTranslations || {},
        description: extension.description,
        descriptionTranslations: extension.descriptionTranslations || {},
        extensionId: extension.id,
        extensionURL: `${EXTENSION_GALLERY_BASE}${extension.slug}.js`,
        iconURL: `${EXTENSION_GALLERY_BASE}${extension.image || 'images/unknown.svg'}`,
        tags: ['tw'],
        credits: [
            ...(extension.original || []),
            ...(extension.by || [])
        ].map(credit => {
            if (credit.link) {
                return (
                    <a
                        href={credit.link}
                        target="_blank"
                        rel="noreferrer"
                        key={credit.name}
                    >
                        {credit.name}
                    </a>
                );
            }
            return credit.name;
        }),
        docsURI: extension.docs ? `${EXTENSION_GALLERY_BASE}${extension.slug}/` : null,
        samples: extension.samples ? extension.samples.map(sample => ({
            href: `${process.env.ROOT}editor.html?project_url=${encodeURIComponent(`${EXTENSION_GALLERY_BASE}samples/${sample}.sb3`)}`,
            text: sample
        })) : null,
        incompatibleWithScratch: !extension.scratchCompatible,
        featured: true,
        dryEggsPick: DRY_EGGS_PICKS.has(extension.slug)
    }));
};

const readPersistentCache = () => {
    try {
        const text = localStorage.getItem(GALLERY_CACHE_KEY);
        if (!text) return null;
        return mapMetadataToLibrary(JSON.parse(text));
    } catch (e) {
        return null;
    }
};

let cachedGallery = readPersistentCache();

const fetchLibrary = async () => {
    const controller = typeof AbortController === 'undefined' ? null : new AbortController();
    const timeout = setTimeout(() => {
        if (controller) controller.abort();
    }, GALLERY_TIMEOUT);
    try {
        const res = await fetch(`${EXTENSION_GALLERY_BASE}generated-metadata/extensions-v0.json`, {
            cache: 'no-store',
            signal: controller ? controller.signal : undefined
        });
        if (!res.ok) {
            throw new Error(`Dry Eggs extension library returned HTTP ${res.status}`);
        }
        const data = await res.json();
        const mapped = mapMetadataToLibrary(data);
        try {
            localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            // The in-memory cache still works when persistent storage is disabled.
        }
        return mapped;
    } finally {
        clearTimeout(timeout);
    }
};

class ExtensionLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
        this.state = {
            gallery: cachedGallery,
            galleryError: null,
            galleryTimedOut: false
        };
    }
    componentDidMount () {
        const timeout = setTimeout(() => {
            if (!this.state.gallery) {
                this.setState({galleryTimedOut: true});
            }
        }, 900);

        fetchLibrary()
            .then(gallery => {
                cachedGallery = gallery;
                this.setState({
                    gallery,
                    galleryError: null,
                    galleryTimedOut: false
                });
                clearTimeout(timeout);
            })
            .catch(error => {
                log.error(error);
                if (!this.state.gallery) {
                    this.setState({galleryError: error});
                }
                clearTimeout(timeout);
            });
    }
    handleItemSelect (item) {
        if (item.href) {
            return;
        }

        const extensionId = item.extensionId;

        if (extensionId === 'custom_extension') {
            this.props.onOpenCustomExtensionModal();
            return;
        }

        if (extensionId === 'procedures_enable_return') {
            this.props.onEnableProcedureReturns();
            this.props.onCategorySelected('myBlocks');
            return;
        }

        const url = item.extensionURL ? item.extensionURL : extensionId;
        if (!item.disabled) {
            if (this.props.vm.extensionManager.isExtensionLoaded(extensionId)) {
                this.props.onCategorySelected(extensionId);
            } else {
                this.props.vm.extensionManager.loadExtensionURL(url)
                    .then(() => {
                        this.props.onCategorySelected(extensionId);
                    })
                    .catch(err => {
                        log.error(err);
                        // eslint-disable-next-line no-alert
                        alert(err);
                    });
            }
        }
    }
    render () {
        let library = [
            toLibraryItem(nativeDryEggsUtilities),
            '---',
            ...extensionLibraryContent.map(toLibraryItem)
        ];
        library.push('---');

        if (this.state.gallery) {
            library.push(toLibraryItem(galleryMore));
            const locale = this.props.intl.locale;
            const galleryItems = this.state.gallery
                .filter(i => i.extensionId !== 'faceSensing')
                .sort((a, b) => Number(b.dryEggsPick) - Number(a.dryEggsPick))
                .map(i => translateGalleryItem(i, locale))
                .map(toLibraryItem);
            library.push(...galleryItems);
        } else if (this.state.galleryError) {
            library.push(toLibraryItem(galleryError));
        } else if (this.state.galleryTimedOut) {
            library.push(toLibraryItem(galleryLoading));
        } else {
            library.push(toLibraryItem(galleryLoading));
        }

        return (
            <LibraryComponent
                data={library}
                filterable
                persistableKey="extensionId"
                id="extensionLibrary"
                tags={extensionTags}
                title={this.props.intl.formatMessage(messages.extensionTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

ExtensionLibrary.propTypes = {
    intl: intlShape.isRequired,
    onCategorySelected: PropTypes.func,
    onEnableProcedureReturns: PropTypes.func,
    onOpenCustomExtensionModal: PropTypes.func,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired // eslint-disable-line react/no-unused-prop-types
};

export default injectIntl(ExtensionLibrary);
