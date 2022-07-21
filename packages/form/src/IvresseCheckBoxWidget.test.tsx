import '@testing-library/jest-dom'
import { render } from '@testing-library/react';
import { describe, it } from "vitest";
import { IvresseCheckboxWidget } from './IvresseCheckboxWidget';

describe('<IvresseCheckboxWidget/>', () => {
    describe('given required and checked', () => {
        it('should be return true value onChange', () => {
            render(<IvresseCheckboxWidget />)
        })
    })
})