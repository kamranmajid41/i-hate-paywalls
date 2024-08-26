import React from 'react';
import { Card } from '@mantine/core';

function GooGoo() {
    return (
        <Card padding="md" shadow="xs" mt="md" radius="md" withBorder>
            <video
                src="/baby_crying.mp4" 
                autoPlay
                loop
                style={{ width: '100%', zindex: 10000 }}
            />
        </Card>
    );
}

export default GooGoo;
