import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useStudioStore } from '../../hooks/useStudioStore';
import { StudioNode } from '../../types/studio';
import { NODE_PROPERTY_SCHEMAS } from '../../constants/propertySchemas';
import { PropertySchema, PropertyGroup, PropertyTemplate, ValidationResult } from '../../types/properties';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  width: number;
  collapsed: boolean;
  onResize: (width: number) => void;
  onToggleCollapse: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  width,
  collapsed,
  onResize,
  onToggleCollapse,
}) => {
  const { state, actions } = useStudioStore();
  const { selection, nodes } = state;

  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['general']));
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PropertyTemplate | null>(null);

  const selectedNode = selection.selectedNodes.length === 1
    ? nodes.get(selection.selectedNodes[0])
    : null;

  const isMultiSelect = selection.selectedNodes.length > 1;

  // Get property schema for the selected node
  const nodeSchema = useMemo(() => {
    if (!selectedNode) return null;
    return NODE_PROPERTY_SCHEMAS[selectedNode.type] || null;
  }, [selectedNode]);

  // Filter properties based on search and visibility
  const filteredProperties = useMemo(() => {
    if (!nodeSchema) return [];

    let properties = nodeSchema.properties;

    // Filter by search term
    if (searchTerm) {
      properties = properties.filter(prop =>
        prop.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter advanced properties
    if (!showAdvanced) {
      properties = properties.filter(prop => !prop.advanced);
    }

    return properties;
  }, [nodeSchema, searchTerm, showAdvanced]);

  // Validate property value
  const validateProperty = useCallback((schema: PropertySchema, value: any): ValidationResult => {
    const errors: string[] = [];

    for (const validation of schema.validation) {
      switch (validation.type) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(validation.message);
          }
          break;
        case 'min':
          if (typeof value === 'number' && value < validation.value) {
            errors.push(validation.message);
          }
          break;
        case 'max':
          if (typeof value === 'number' && value > validation.value) {
            errors.push(validation.message);
          }
          if (typeof value === 'string' && value.length > validation.value) {
            errors.push(validation.message);
          }
          break;
        case 'pattern':
          if (typeof value === 'string' && !validation.value.test(value)) {
            errors.push(validation.message);
          }
          break;
        case 'custom':
          if (validation.validator && !validation.validator(value)) {
            errors.push(validation.message);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Handle property change with validation
  const handlePropertyChange = useCallback((propertyId: string, value: any) => {
    if (!selectedNode || !nodeSchema) return;

    // Find property schema
    const propertySchema = nodeSchema.properties.find(p => p.id === propertyId);
    if (!propertySchema) return;

    // Validate the value
    const validation = validateProperty(propertySchema, value);

    // Update edited values
    setEditedValues(prev => ({ ...prev, [propertyId]: value }));

    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [propertyId]: validation.errors
    }));

    // Update node if validation passes
    if (validation.isValid) {
      const updates: Partial<StudioNode> = {};

      if (propertyId === 'label') {
        updates.data = { ...selectedNode.data, label: value };
      } else if (propertyId === 'description') {
        updates.data = { ...selectedNode.data, description: value };
      } else if (['x', 'y'].includes(propertyId)) {
        updates.position = {
          ...selectedNode.position,
          [propertyId]: parseFloat(value) || 0
        };
      } else if (['width', 'height'].includes(propertyId)) {
        updates.size = {
          ...selectedNode.size,
          [propertyId]: parseFloat(value) || 0
        };
      } else {
        // Update other properties in data
        updates.data = {
          ...selectedNode.data,
          properties: {
            ...selectedNode.data.properties,
            [propertyId]: value
          }
        };
      }

      actions.updateNode(selectedNode.id, updates);
    }
  }, [selectedNode, nodeSchema, validateProperty, actions]);

  // Apply property template
  const applyTemplate = useCallback((template: PropertyTemplate) => {
    if (!selectedNode || !nodeSchema) return;

    setSelectedTemplate(template);

    // Apply template properties
    Object.entries(template.properties).forEach(([propertyId, value]) => {
      handlePropertyChange(propertyId, value);
    });
  }, [selectedNode, nodeSchema, handlePropertyChange]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    if (!selectedNode || !nodeSchema) return;

    nodeSchema.properties.forEach(property => {
      handlePropertyChange(property.id, property.defaultValue);
    });

    setEditedValues({});
    setValidationErrors({});
  }, [selectedNode, nodeSchema, handlePropertyChange]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Get current property value
  const getPropertyValue = useCallback((propertyId: string): any => {
    if (editedValues.hasOwnProperty(propertyId)) {
      return editedValues[propertyId];
    }

    if (!selectedNode) return '';

    switch (propertyId) {
      case 'label':
        return selectedNode.data.label;
      case 'description':
        return selectedNode.data.description || '';
      case 'x':
        return selectedNode.position.x;
      case 'y':
        return selectedNode.position.y;
      case 'width':
        return selectedNode.size.width;
      case 'height':
        return selectedNode.size.height;
      default:
        return selectedNode.data.properties?.[propertyId] || '';
    }
  }, [selectedNode, editedValues]);

  // Clear edited values when node changes
  useEffect(() => {
    setEditedValues({});
    setValidationErrors({});
    setSelectedTemplate(null);
  }, [selectedNode?.id]);

  if (collapsed) {
    return (
      <div className="properties-panel collapsed">
        <button
          className="panel-toggle"
          onClick={onToggleCollapse}
          aria-label="Expand properties panel"
        >
          ◀️
        </button>
      </div>
    );
  }

  return (
    <div className="properties-panel" style={{ width }}>
      {/* Header */}
      <div className="panel-header">
        <h3>Properties</h3>
        <button
          className="panel-toggle"
          onClick={onToggleCollapse}
          aria-label="Collapse properties panel"
        >
          ▶️
        </button>
      </div>

      {/* Search and Controls */}
      {selectedNode && nodeSchema && (
        <div className="panel-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="property-search"
            />
          </div>

          <div className="control-buttons">
            <button
              className="btn-icon"
              onClick={() => setShowAdvanced(!showAdvanced)}
              title={showAdvanced ? 'Hide advanced properties' : 'Show advanced properties'}
            >
              ⚙️
            </button>
            <button
              className="btn-icon"
              onClick={resetToDefaults}
              title="Reset to defaults"
            >
              ↻
            </button>
          </div>
        </div>
      )}

      {/* Templates */}
      {selectedNode && nodeSchema && nodeSchema.templates.length > 0 && (
        <div className="templates-section">
          <div className="templates-header">
            <h4>Templates</h4>
          </div>
          <div className="templates-list">
            {nodeSchema.templates.map(template => (
              <button
                key={template.id}
                className={`template-item ${selectedTemplate?.id === template.id ? 'active' : ''}`}
                onClick={() => applyTemplate(template)}
                title={template.description}
              >
                <span className="template-name">{template.name}</span>
                <span className="template-category">{template.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="panel-content">
        {isMultiSelect ? (
          <div className="multi-selection">
            <div className="multi-selection-header">
              <h4>{selection.selectedNodes.length} nodes selected</h4>
              <span className="selection-count">
                {selection.selectedNodes.length} items
              </span>
            </div>
            <div className="bulk-actions">
              <button className="btn-primary">Edit Properties</button>
              <button className="btn-secondary">Align Nodes</button>
              <button className="btn-secondary">Distribute</button>
            </div>
          </div>
        ) : selectedNode && nodeSchema ? (
          <div className="node-properties">
            {/* Grouped Properties */}
            {nodeSchema.groups.map(group => {
              const groupProperties = filteredProperties.filter(prop => prop.group === group.id);
              if (groupProperties.length === 0) return null;

              const isExpanded = expandedGroups.has(group.id);

              return (
                <div key={group.id} className="property-group">
                  <div
                    className="group-header"
                    onClick={() => group.collapsible && toggleGroup(group.id)}
                  >
                    <h4>{group.label}</h4>
                    {group.collapsible && (
                      <button className="group-toggle">
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    )}
                  </div>

                  {(!group.collapsible || isExpanded) && (
                    <div className="group-content">
                      {groupProperties
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(property => (
                          <PropertyField
                            key={property.id}
                            schema={property}
                            value={getPropertyValue(property.id)}
                            onChange={(value) => handlePropertyChange(property.id, value)}
                            error={validationErrors[property.id]?.[0]}
                          />
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-selection">
            <div className="no-selection-icon">🔍</div>
            <h4>No Node Selected</h4>
            <p>Select a node to edit its properties</p>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div
        className="panel-resize-handle"
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = width;

          const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(280, Math.min(500, startWidth - (e.clientX - startX)));
            onResize(newWidth);
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
    </div>
  );
};

// Property Field Component
interface PropertyFieldProps {
  schema: PropertySchema;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const PropertyField: React.FC<PropertyFieldProps> = ({ schema, value, onChange, error }) => {
  const renderField = () => {
    switch (schema.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.description}
            className={error ? 'error' : ''}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => onChange(Number(e.target.value))}
            min={schema.validation.find(v => v.type === 'min')?.value}
            max={schema.validation.find(v => v.type === 'max')?.value}
            className={error ? 'error' : ''}
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'error' : ''}
          >
            <option value="">Select...</option>
            {schema.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.description}
            rows={3}
            className={error ? 'error' : ''}
          />
        );

      case 'slider':
        return (
          <div className="slider-container">
            <input
              type="range"
              min={schema.validation.find(v => v.type === 'min')?.value || 0}
              max={schema.validation.find(v => v.type === 'max')?.value || 1}
              step="0.1"
              value={value || schema.defaultValue}
              onChange={(e) => onChange(Number(e.target.value))}
            />
            <span className="slider-value">{value?.toFixed(1) || schema.defaultValue}</span>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${schema.type}...`}
            className={error ? 'error' : ''}
          />
        );
    }
  };

  return (
    <div className="property-field">
      <label className="property-label">
        {schema.label}
        {schema.required && <span className="required">*</span>}
        {schema.advanced && <span className="advanced-badge">ADV</span>}
      </label>
      {schema.description && (
        <div className="property-description">{schema.description}</div>
      )}
      <div className="property-input">
        {renderField()}
      </div>
      {error && <div className="property-error">{error}</div>}
    </div>
  );
};
