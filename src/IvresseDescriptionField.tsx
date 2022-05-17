import { FieldProps } from "@rjsf/core";

export interface DescriptionFieldProps extends Partial<FieldProps> {
  description?: string;
}

export const IvresseDescriptionField = ({ description }: Partial<FieldProps>) => {
  if (description) {
    return <small><div className="mb-3 text-muted">{description}</div></small>;
  }

  return null;
};

