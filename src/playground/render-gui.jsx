import React from 'react';
import GUI from '../containers/gui.jsx';

const searchParams = new URLSearchParams(location.search);
const cloudHost = searchParams.get('cloud_host');

const RenderGUI = props => (
    <GUI
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
