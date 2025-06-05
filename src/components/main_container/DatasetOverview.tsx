import React from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaExclamationCircle } from 'react-icons/fa';
import { useState } from 'react';

interface DatasetOverviewProps {
  rocrate: Record<string, any>;
  onSelect: (datasetId: string) => void;
}

const IconComponent: React.FC<{ isHovered: boolean }> = ({ isHovered }) => {
    return (
        <div className="mr-2">
            {isHovered ? <span>{React.createElement(FaFolderOpen as React.ComponentType)}</span> : <span>{React.createElement(FaFolder as React.ComponentType)}</span>}
        </div>
    );
};

const DatasetOverview: React.FC<DatasetOverviewProps> = ({ rocrate, onSelect }) => {

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Extract datasets from the RO-Crate metadata
  console.log('RO-Crate Metadata:', rocrate);
  const datasets = Object.values(rocrate["@graph"]).filter((item: any) => {
      const type = item['@type'];
      return Array.isArray(type) ? type.includes('Dataset') : type === 'Dataset';
  }).map((dataset: any) => ({
      ...dataset,
      '@type': Array.isArray(dataset['@type']) ? dataset['@type'] : [dataset['@type']],
  }));
  console.log('Datasets:', datasets);

  // Create datasetInfo object
  const datasetInfo = datasets.reduce((info: Record<string, any>, dataset: any) => {
      const isChild = datasets.some((parent: any) =>
          parent.hasPart?.some((part: any) => part['@id'] === dataset['@id'])
      );
      const datasetCount = dataset.hasPart?.filter((part: any) => {
          const partEntry = rocrate["@graph"].find((entry: any) => entry["@id"] === part["@id"]);
          const type = Array.isArray(partEntry?.["@type"]) ? partEntry["@type"] : [partEntry?.["@type"]];
          return type.includes('Dataset');
      }).length || 0;
      
      const fileCount = dataset.hasPart?.filter((part: any) => {
          const partEntry = rocrate["@graph"].find((entry: any) => entry["@id"] === part["@id"]);
          const type = Array.isArray(partEntry?.["@type"]) ? partEntry["@type"] : [partEntry?.["@type"]];
          return type.includes('File');
      }).length || 0;
  
      info[dataset['@id']] = {
          isChild,
          datasetCount,
          fileCount,
      };
  
      return info;
  }, {});

  console.log('Dataset Info:', datasetInfo);

  // Compute soloFiles: @id's that do not have a parent and are not part of any datasets
  const allIds = new Set(rocrate["@graph"].map((item: any) => item["@id"]));
  const datasetIds = new Set(datasets.map((dataset: any) => dataset["@id"]));
  const parentIds = new Set(
      datasets.flatMap((dataset: any) =>
          dataset.hasPart?.map((part: any) => part["@id"]) || []
      )
  );
  const soloFiles: string[] = Array.from(allIds)
      .filter((id): id is string => typeof id === 'string' && !datasetIds.has(id) && !parentIds.has(id))
      .filter((id) => {
          const entry = rocrate["@graph"].find((item: any) => item["@id"] === id);
          const type = Array.isArray(entry?.["@type"]) ? entry["@type"] : [entry?.["@type"]];
          return type.includes("File");
      });

  console.log('Solo Files:', soloFiles);

  // Filter datasets where isChild is false
  const parentDatasets = Object.entries(datasetInfo)
    .filter(([_, info]) => !info.isChild)
    .map(([id, info]) => ({
      id,
      ...info,
    }));

  console.log('Parent Datasets:', parentDatasets);

  return (
      <div>
          <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parentDatasets.map((dataset) => (
                      <div
                          key={dataset.id}
                          className="bg-white shadow-md rounded-lg p-4 hover:cursor-pointer"
                          onClick={() => onSelect(dataset.id)}
                          onMouseEnter={() => { setHoveredCard(dataset.id); }}
                          onMouseLeave={() => { setHoveredCard(null); }}
                      >
                          <h4 className="text-lg font-bold flex items-center">
                              <span className="icon">
                                  <IconComponent isHovered={hoveredCard === dataset.id} />
                              </span>
                              {dataset.id}
                          </h4>
                          <div className="mt-2">
                              {['datasetCount', 'fileCount'].map((type, index) => (
                                  <span
                                      key={index}
                                      className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                                  >
                                      {type === 'datasetCount'
                                          ? `direct child datasets: ${dataset[type]}`
                                          : `direct child files: ${dataset[type]}`}
                                  </span>
                              ))}
                          </div>
                      </div>
                  ))}
                  {soloFiles.map((fileId) => (
                      <div
                          key={fileId}
                          className="bg-white shadow-md rounded-lg p-4 hover:cursor-pointer"
                          onClick={() => onSelect(fileId)}
                          onMouseEnter={() => { setHoveredCard(fileId); }}
                          onMouseLeave={() => { setHoveredCard(null); }}
                      >
                          <div className="text-lg font-bold flex items-center relative">
                              <FaFile className="mr-2 text-gray-500" />
                              <span className="mr-2">{fileId}</span>
                              <div className="relative group">
                                  <FaExclamationCircle className="text-orange-500 cursor-pointer" />
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-orange-100 text-orange-800 text-xs font-semibold p-2 rounded shadow-lg w-64">
                                      It is not proper data management to have lingering files that are not connected to a dataset entity.
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};

export default DatasetOverview;