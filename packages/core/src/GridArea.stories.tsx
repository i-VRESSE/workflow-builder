import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { GridArea } from './GridArea';

export default {
  component: GridArea
} as ComponentMeta<typeof GridArea>;

/**
 * Example from https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas#specifying_named_grid_areas
 */
export const Default: ComponentStory<typeof GridArea> = () => {
  const pageStyle = {
    "display":"grid",
    "width":"100%",
    "height":"250px",
    "gridTemplateAreas":"\"head head\"\n\"nav main\"\n\"nav foot\"",
    "gridTemplateRows":"50px 1fr 30px",
    "gridTemplateColumns":"150px 1fr"
  }
  return (
    <section id="page" style={pageStyle}>
        <GridArea area="head" style={{ backgroundColor: '#8ca0ff'}}>Header</GridArea>
        <GridArea area="nav" style={{ backgroundColor: '#ffa08c'}}>Nav</GridArea>
        <GridArea area="main" style={{ backgroundColor: '#ffff64'}}>Main</GridArea>
        <GridArea area="foot" style={{ backgroundColor: '#8cffa0'}}>Footer</GridArea>
    </section>
  )
}