import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { UserSelector } from '../molecules/UserSelector';
import { AsignacionFormData, AssignmentItem, SearchUser, Month } from '../../types';
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';
import { Label } from '../atoms/Label';
import { Select } from '../atoms/Select';

const assignmentItemSchema = yup.object({
  name: yup.string().required('Name is required').trim(),
  minutos: yup.number().required('Minutes are required').min(1, 'Minutes must be at least 1').max(60, 'Minutes cannot exceed 60'),
  encargadoId: yup.string().optional()
});

const schema = yup.object({
  name: yup.string().required('Assignment name is required').trim(),
  semana: yup.string().required('Week is required').trim(),
  month: yup.string().oneOf(Object.values(Month), 'Invalid month').required('Month is required'),
  parentId: yup.string().optional(),
  presidenteId: yup.string().optional(),
  presidenteReunionId: yup.string().optional(),
  lectorReunionId: yup.string().optional(),
  oracionFinalVMId: yup.string().optional(),
  oracionFinalPublicaId: yup.string().optional(),
  tesorosDeLaBiblia: yup.array().of(assignmentItemSchema).min(1, 'At least one Tesoros de la Biblia item is required'),
  seamosMejoresMaestros: yup.array().of(assignmentItemSchema).min(1, 'At least one Seamós Mejores Maestros item is required'),
  nuestraVidaCristiana: yup.array().of(assignmentItemSchema).min(1, 'At least one Nuestra Vida Cristiana item is required')
});

interface AssignmentFormProps {
  initialData?: AsignacionFormData;
  onSubmit: (data: AsignacionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface AssignmentItemFieldProps {
  items: AssignmentItem[];
  onChange: (items: AssignmentItem[]) => void;
  title: string;
  error?: string;
}

function AssignmentItemFields({ items, onChange, title, error }: AssignmentItemFieldProps) {
  const addItem = () => {
    onChange([...items, { name: '', minutos: 10, encargadoId: undefined }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      onChange(newItems);
    }
  };

  const updateItem = (index: number, field: keyof AssignmentItem, value: string | number | undefined) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const handleEncargadoChange = (index: number, userId: string | undefined, user: SearchUser | undefined) => {
    updateItem(index, 'encargadoId', userId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <Button
          type="button"
          onClick={addItem}
          variant="secondary"
          className="w-auto px-3 py-1 text-sm"
        >
          Agregar Item
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                label="Nombre *"
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="Ingrese el nombre del item"
              />

              <FormField
                label="Minutos *"
                type="number"
                value={item.minutos}
                onChange={(e) => updateItem(index, 'minutos', parseInt(e.target.value) || 0)}
                min={1}
                max={60}
              />
            </div>

            <div>
              <UserSelector
                value={item.encargadoId}
                onChange={(userId, user) => handleEncargadoChange(index, userId, user)}
                label="Encargado"
                placeholder="Buscar encargado..."
              />
            </div>

            {items.length > 1 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => removeItem(index)}
                  variant="danger"
                  className="w-auto px-3 py-1 text-sm"
                >
                  Eliminar Item
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssignmentForm({ initialData, onSubmit, onCancel, isLoading = false }: AssignmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<AsignacionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: initialData || {
      name: '',
      semana: '',
      month: Month.Enero,
      tesorosDeLaBiblia: [{ name: '', minutos: 10, encargadoId: undefined }],
      seamosMejoresMaestros: [{ name: '', minutos: 10, encargadoId: undefined }],
      nuestraVidaCristiana: [{ name: '', minutos: 10, encargadoId: undefined }]
    }
  });

  const watchedArrays = {
    tesorosDeLaBiblia: watch('tesorosDeLaBiblia'),
    seamosMejoresMaestros: watch('seamosMejoresMaestros'),
    nuestraVidaCristiana: watch('nuestraVidaCristiana')
  };

  const handleArrayChange = (field: keyof typeof watchedArrays, items: AssignmentItem[]) => {
    setValue(field, items);
    trigger(field);
  };

  const onFormSubmit = async (data: AsignacionFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Nombre Asignación *"
          type="text"
          placeholder="Ingrese el nombre de la asignación"
          error={errors.name?.message}
          {...register('name')}
        />

        <FormField
          label="Semana *"
          type="text"
          placeholder="e.g., 2-8 DE FEBRERO_ ISAÍAS 30-32"
          error={errors.semana?.message}
          {...register('semana')}
        />

        <div className="mb-4">
          <Label htmlFor="month">Mes <span className="text-red-500">*</span></Label>
          <Select
            id="month"
            {...register('month')}
            error={!!errors.month}
          >
            {Object.values(Month).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          {errors.month && (
            <p className="text-sm text-red-600 mt-1 dark:text-red-400">
              {errors.month.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UserSelector
          value={watch('presidenteId')}
          onChange={(userId) => {
            setValue('presidenteId', userId);
            trigger('presidenteId');
          }}
          label="Presidente"
          placeholder="Search for presidente..."
          error={errors.presidenteId?.message}
        />

        <UserSelector
          value={watch('presidenteReunionId')}
          onChange={(userId) => {
            setValue('presidenteReunionId', userId);
            trigger('presidenteReunionId');
          }}
          label="Presidente Reunión"
          placeholder="Search for presidente reunión..."
          error={errors.presidenteReunionId?.message}
        />

        <UserSelector
          value={watch('lectorReunionId')}
          onChange={(userId) => {
            setValue('lectorReunionId', userId);
            trigger('lectorReunionId');
          }}
          label="Lector R/P"
          placeholder="Buscar lector reunión..."
          error={errors.lectorReunionId?.message}
        />

        <UserSelector
          value={watch('oracionFinalVMId')}
          onChange={(userId) => {
            setValue('oracionFinalVMId', userId);
            trigger('oracionFinalVMId');
          }}
          label="Oración Final V/M"
          placeholder="Search for oración final V/M..."
          error={errors.oracionFinalVMId?.message}
        />

        <UserSelector
          value={watch('oracionFinalPublicaId')}
          onChange={(userId) => {
            setValue('oracionFinalPublicaId', userId);
            trigger('oracionFinalPublicaId');
          }}
          label="Oración Final Pública"
          placeholder="Search for oración final pública..."
          error={errors.oracionFinalPublicaId?.message}
        />
      </div>

      <AssignmentItemFields
        items={watchedArrays.tesorosDeLaBiblia}
        onChange={(items) => handleArrayChange('tesorosDeLaBiblia', items)}
        title="Tesoros de la Biblia"
        error={errors.tesorosDeLaBiblia?.message}
      />

      <AssignmentItemFields
        items={watchedArrays.seamosMejoresMaestros}
        onChange={(items) => handleArrayChange('seamosMejoresMaestros', items)}
        title="Seamós Mejores Maestros"
        error={errors.seamosMejoresMaestros?.message}
      />

      <AssignmentItemFields
        items={watchedArrays.nuestraVidaCristiana}
        onChange={(items) => handleArrayChange('nuestraVidaCristiana', items)}
        title="Nuestra Vida Cristiana"
        error={errors.nuestraVidaCristiana?.message}
      />

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
        <Button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          variant="secondary"
          className="w-auto px-4"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          variant="primary"
          className="w-auto px-4"
        >
          {isLoading ? 'Saving...' : 'Save Assignment'}
        </Button>
      </div>
    </form>
  );
}