import PropTypes from 'prop-types'
import React from 'react'

const propTypes = {
  onSelectChange: PropTypes.func,
  onTextChange: PropTypes.func,
}
export default class FarmingMethodInputs extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////


  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////


  render() {
    return (
      <div>
        <input type="text" onChange={this.props.onTextChange} />

        <select defaultValue='default' onChange={this.props.onSelectChange}>
          <option value="default" disabled hidden>
            --Select Farm Map--
          </option><option  disabled>
            --Level 80 Zones--
          </option><option  value = "Frostgorge Sound">
            Frostgorge Sound
          </option><option  value = "Malchor's Leap">
            {`Malchor's Leap`}
          </option><option  value = "Cursed Shore">
            Cursed Shore
          </option><option  value = "Southsun Cove">
            Southsun Cove
          </option><option  value = "Dry Top">
            Dry Top
          </option><option  value = "The Silverwastes">
            The Silverwastes
          </option><option  value = "Verdant Brink">
            Verdant Brink
          </option><option  value = "Auric Basin">
            Auric Basin
          </option><option  value = "Tangled Depths">
            Tangled Depths
          </option><option  value = "Dragon's Stand">
            {`Dragon's Stand`}
          </option><option  value = "Bloodstone Fen">
            Bloodstone Fen
          </option><option  value = "Ember Bay">
            Ember Bay
          </option><option  value = "Bitterfrost Frontier">
            Bitterfrost Frontier
          </option><option  value = "Lake Doric">
            Lake Doric
          </option><option  value = "Draconis Mons">
            Draconis Mons
          </option><option  value = "Siren's Landing">
            {`Siren's Landing`}
          </option><option  value = "Crystal Oasis">
            Crystal Oasis
          </option><option  value = "Desert Highlands">
            Desert Highlands
          </option><option  value = "Elon Riverlands">
            Elon Riverlands
          </option><option  value = "The Desolation">
            The Desolation
          </option><option  value = "Domain of Vabbi">
            Domain of Vabbi
          </option><option  value = "Domain of Istan">
            Domain of Istan
          </option><option  value = "Sandswept Isles">
            Sandswept Isles
          </option>

          <option  disabled>
            --Instanced Content--
          </option><option  value = "Dungeons">
            Dungeons
          </option><option  value = "Fractals">
            Fractals
          </option><option  value = "Raids">
            Raids
          </option>

          <option  disabled>
            --Lower Level Zones--
          </option><option  value = "Caledon Forest">
            Caledon Forest
          </option><option  value = "Metrica Province">
            Metrica Province
          </option><option  value = "Plains of Ashford">
            Plains of Ashford
          </option><option  value = "Queensdale">
            Queensdale
          </option><option  value = "Wayfarer Foothills">
            Wayfarer Foothills
          </option><option  value = "Brisban Wildlands">
            Brisban Wildlands
          </option><option  value = "Diessa Plateau">
            Diessa Plateau
          </option><option  value = "Kessex Hills">
            Kessex Hills
          </option><option  value = "Snowden Drifts">
            Snowden Drifts
          </option><option  value = "Gendarran Fields">
            Gendarran Fields
          </option><option  value = "Lornar's Pass">
            {`Lornar's Pass`}
          </option><option  value = "Fields of Ruin">
            Fields of Ruin
          </option><option  value = "Harathi Hinterlands">
            Harathi Hinterlands
          </option><option  value = "Blazeridge Steppes">
            Blazeridge Steppes
          </option><option  value = "Dredgehaunt Cliffs">
            Dredgehaunt Cliffs
          </option><option  value = "Bloodtide Coast">
            Bloodtide Coast
          </option><option  value = "Iron Marches">
            Iron Marches
          </option><option  value = "Timberline Falls">
            Timberline Falls
          </option><option  value = "Sparkfly Fen">
            Sparkfly Fen
          </option><option  value = "Fireheart Rise">
            Fireheart Rise
          </option><option  value = "Mount Maelstrom">
            Mount Maelstrom
          </option><option  value = "Straits of Devastation">
            Straits of Devastation
          </option>

          <option  disabled>
            --Home Instance--
          </option><option  value = "Rata Sum">
            Rata Sum
          </option><option  value = "Divinity's Reach">
            {`Divinity's Reach`}
          </option><option  value = "The Grove">
            The Grove
          </option><option  value = "Black Citadel">
            Black Citadel
          </option><option  value = "Hoelbrak">
            Hoelbrak
          </option>

          <option  disabled>
            --Other--
          </option><option  value = "WvW">
            WvW
          </option><option  value = "Lion's Arch">
            {`Lion's Arch`}
          </option><option  value = "Other">
            Other
          </option>
        </select>

      </div>
    )
  }
}

FarmingMethodInputs.propTypes = propTypes
