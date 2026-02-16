import { useForm as useReactHookForm, UseFormProps, FieldValues, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface UseFormCustomProps<T extends FieldValues> extends UseFormProps<T> {
  schema?: yup.ObjectSchema<T>;
}

export function useForm<T extends FieldValues>({ schema, ...props }: UseFormCustomProps<T>) {
  return useReactHookForm({
    ...props,
    resolver: schema ? (yupResolver(schema) as unknown as Resolver<T>) : undefined,
  });
}
