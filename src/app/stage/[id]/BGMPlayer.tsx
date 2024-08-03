import React, { useState, useRef } from 'react';

const BGMPlayer = ({ audioSrc }: { audioSrc: string }) => {
    const audioRef = useRef(null);
    return (
        <div className="bgm-player">
            <audio ref={audioRef} src={audioSrc} loop />
        </div>
    );
};

export default BGMPlayer;