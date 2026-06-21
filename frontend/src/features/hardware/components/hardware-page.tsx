'use client';

import { useRole } from '@/src/hooks/use-role';
import { Tabs } from '@heroui/react';
import {
  cpuResource,
  gpuResource,
  hardwareResources,
  motherboardResource,
  psuResource,
  ramResource,
  ssdResource,
} from '../config';
import { HardwareResourcePanel } from './hardware-resource-panel';

const HardwarePage = () => {
  const role = useRole();
  const canManage = role === 'admin' || role === 'supervisor';

  return (
    <div className="w-full max-w-7xl mx-auto px-8 md:px-16 py-12 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hardware Catalog</h1>
        <p className="text-sm text-gray-400 mt-2">
          Browse the available components used to build and benchmark PCs.
        </p>
      </div>

      <Tabs>
        <Tabs.List>
          {hardwareResources.map((resource) => (
            <Tabs.Tab key={resource.key} id={resource.key}>
              {resource.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel id="cpu">
          <HardwareResourcePanel resource={cpuResource} canManage={canManage} />
        </Tabs.Panel>
        <Tabs.Panel id="gpu">
          <HardwareResourcePanel resource={gpuResource} canManage={canManage} />
        </Tabs.Panel>
        <Tabs.Panel id="ram">
          <HardwareResourcePanel resource={ramResource} canManage={canManage} />
        </Tabs.Panel>
        <Tabs.Panel id="motherboard">
          <HardwareResourcePanel resource={motherboardResource} canManage={canManage} />
        </Tabs.Panel>
        <Tabs.Panel id="psu">
          <HardwareResourcePanel resource={psuResource} canManage={canManage} />
        </Tabs.Panel>
        <Tabs.Panel id="ssd">
          <HardwareResourcePanel resource={ssdResource} canManage={canManage} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default HardwarePage;
