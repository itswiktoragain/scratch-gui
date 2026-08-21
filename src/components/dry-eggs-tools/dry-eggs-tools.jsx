import PropTypes from 'prop-types';
import React from 'react';

import styles from './dry-eggs-tools.css';

const EXTENSION_LIBRARY_URL = 'https://itswiktoragain.github.io/extensions-well-thats-quite-new/';

class DryEggsTools extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            open: false,
            copied: false,
            codingFocus: document.documentElement.dataset.dryEggsCodingFocus === 'true',
            motion: document.documentElement.dataset.dryEggsMotion !== 'off'
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.toggleOpen = this.toggleOpen.bind(this);
        this.close = this.close.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.copyProjectLink = this.copyProjectLink.bind(this);
        this.toggleCodingFocus = this.toggleCodingFocus.bind(this);
        this.toggleMotion = this.toggleMotion.bind(this);
    }

    componentDidMount () {
        window.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.handleKeyDown);
        if (this.copyTimer) clearTimeout(this.copyTimer);
    }

    handleKeyDown (event) {
        const modifier = event.ctrlKey || event.metaKey;
        if (modifier && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            this.toggleOpen();
        } else if (modifier && event.shiftKey && event.key.toLowerCase() === 'e') {
            event.preventDefault();
            this.props.onOpenExtensions();
        } else if (modifier && event.shiftKey && event.key.toLowerCase() === 'f') {
            event.preventDefault();
            this.toggleFullscreen();
        } else if (event.key === 'Escape' && this.state.open) {
            this.close();
        }
    }

    toggleOpen () {
        this.setState(state => ({open: !state.open}));
    }

    close () {
        this.setState({open: false});
    }

    toggleFullscreen () {
        if (document.fullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen();
        } else if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
        this.close();
    }

    copyProjectLink () {
        const text = window.location.href;
        const markCopied = () => {
            this.setState({copied: true});
            this.copyTimer = setTimeout(() => this.setState({copied: false}), 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(markCopied).catch(() => this.fallbackCopy(text, markCopied));
        } else {
            this.fallbackCopy(text, markCopied);
        }
    }

    fallbackCopy (text, callback) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            callback();
        } finally {
            textarea.remove();
        }
    }

    toggleCodingFocus () {
        const codingFocus = !this.state.codingFocus;
        document.documentElement.dataset.dryEggsCodingFocus = String(codingFocus);
        this.setState({codingFocus});
    }

    toggleMotion () {
        const motion = !this.state.motion;
        document.documentElement.dataset.dryEggsMotion = motion ? 'on' : 'off';
        try {
            localStorage.setItem('dry-eggs-motion', motion ? 'on' : 'off');
        } catch (e) {
            // Storage can be unavailable in privacy-restricted contexts.
        }
        this.setState({motion});
    }

    renderAction (icon, title, detail, onClick, active) {
        return (
            <button
                className={styles.action}
                type="button"
                onClick={onClick}
            >
                <span className={styles.actionIcon}>{icon}</span>
                <span className={styles.actionText}>
                    <strong>{title}</strong>
                    <small>{detail}</small>
                </span>
                {typeof active === 'boolean' ? (
                    <span className={active ? styles.statusOn : styles.statusOff}>
                        {active ? 'On' : 'Off'}
                    </span>
                ) : null}
            </button>
        );
    }

    render () {
        return (
            <React.Fragment>
                <button
                    className={styles.launcher}
                    type="button"
                    title="Dry Eggs tools (Ctrl+K)"
                    onClick={this.toggleOpen}
                >
                    <span className={styles.egg}>●</span>
                    <span className={styles.launcherLabel}>Dry Eggs Tools</span>
                    <span className={styles.shortcut}>Ctrl K</span>
                </button>
                {this.state.open ? (
                    <div
                        className={styles.backdrop}
                        role="presentation"
                        onMouseDown={this.close}
                    >
                        <section
                            className={styles.palette}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Dry Eggs tools"
                            onMouseDown={event => event.stopPropagation()}
                        >
                            <header className={styles.header}>
                                <div>
                                    <div className={styles.eyebrow}>DRY EGGS</div>
                                    <h2>Quick tools</h2>
                                    <p>Editor features built into Dry Eggs.</p>
                                </div>
                                <button
                                    className={styles.close}
                                    type="button"
                                    aria-label="Close"
                                    onClick={this.close}
                                >
                                    ×
                                </button>
                            </header>
                            <div className={styles.grid}>
                                {this.renderAction('↥', 'Open project file', 'Load an SB3 from your computer', () => {
                                    this.props.onOpenProjectFile();
                                    this.close();
                                })}
                                {this.renderAction('✦', 'Extension Library', 'Open the native Dry Eggs library', () => {
                                    this.props.onOpenExtensions();
                                    this.close();
                                })}
                                {this.renderAction('⌁', 'Coding focus', 'Hide the stage pane and use the full width', this.toggleCodingFocus, this.state.codingFocus)}
                                {this.renderAction('⛶', 'Browser fullscreen', 'Use the entire display · Ctrl+Shift+F', this.toggleFullscreen)}
                                {this.renderAction(this.state.copied ? '✓' : '⧉', this.state.copied ? 'Link copied' : 'Copy project link', 'Copy the current Dry Eggs URL', this.copyProjectLink)}
                                {this.renderAction('≈', 'Interface animations', 'Turn Dry Eggs motion effects on or off', this.toggleMotion, this.state.motion)}
                                {this.renderAction('↗', 'Open new window', 'Open this project in another tab', () => window.open(window.location.href, '_blank', 'noopener,noreferrer'))}
                                {this.renderAction('↻', 'Reload editor', 'Reload without changing the project URL', () => window.location.reload())}
                            </div>
                            <footer className={styles.footer}>
                                <button
                                    type="button"
                                    onClick={() => window.open(EXTENSION_LIBRARY_URL, '_blank', 'noopener,noreferrer')}
                                >
                                    Open full extension site ↗
                                </button>
                                <span>Ctrl+Shift+E opens extensions</span>
                            </footer>
                        </section>
                    </div>
                ) : null}
            </React.Fragment>
        );
    }
}

DryEggsTools.propTypes = {
    onOpenExtensions: PropTypes.func.isRequired,
    onOpenProjectFile: PropTypes.func.isRequired
};

export default DryEggsTools;
