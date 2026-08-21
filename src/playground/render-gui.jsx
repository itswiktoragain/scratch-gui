import React from 'react';
import GUI from '../containers/gui.jsx';
import DryEggsTools from '../components/dry-eggs-tools/dry-eggs-tools.jsx';
import dryEggsLogo from '../lib/assets/dry-eggs-logo.svg';

const searchParams = new URLSearchParams(location.search);
const cloudHost = searchParams.get('cloud_host');

const RenderGUI = props => (
    <React.Fragment>
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
        {!props.isPlayerOnly && <DryEggsTools />}
    </React.Fragment>
);

export default RenderGUI;
