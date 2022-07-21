import React from 'react'
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from "vitest";
import { IvresseCheckboxWidget } from './IvresseCheckboxWidget';
import { IvresseDescriptionField } from './IvresseDescriptionField';

afterEach(cleanup)

describe('<IvresseCheckboxWidget/>', () => {
    describe('given required and unchecked', () => {
        it('should have valid checkbox input element', () => {
            const props = {
                id: 'someid',
                label: 'Some label',
                schema: {},
                uiSchema: {},
                disabled: false,
                readonly: false,
                autofocus: false,
                options: {},
                formContext: {},
                onChange: vi.fn(),
                placeholder: '',
                onBlur: vi.fn(),
                onFocus: vi.fn(),
                multiple: false,
                rawErrors: [],
                registry: {
                    fields: {},
                    widgets: {},
                    formContext: {},
                    rootSchema: {},
                    definitions: {}
                },
                DescriptionField: IvresseDescriptionField
            }
            render(<IvresseCheckboxWidget required value={false} {...props}/>)
            const input: HTMLInputElement = screen.getByLabelText('Some label')
            expect(input.checkValidity()).toBeTruthy()
        })
    })
})

it('sanity check - <input type="checkbox" required>.checkValidity() === false', () => {
    render(<label><input type="checkbox" required/>Some label</label>)
    const input: HTMLInputElement = screen.getByLabelText('Some label')
    expect(input.checkValidity()).toBeFalsy()
})
