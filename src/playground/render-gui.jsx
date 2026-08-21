import React from 'react';
import GUI from '../containers/gui.jsx';
import dryEggsLogo from '../lib/assets/dry-eggs-logo.svg';

const searchParams = new URLSearchParams(location.search);
const cloudHost = searchParams.get('cloud_host');

const RenderGUI = props => (
    <GUI
        logo={dryEggsLogo}
        cloudHost={cloudHost || undefined}
        canUseCloud={Boolean(cloudHost)}
        hasCloudPermission={Boolean(cloudHost)}
        canSave={false}
        basePath={process.env.ROOT}
        canEditTitle
        enableCommunity
        {...props}
    />
);

export default RenderGUI;
