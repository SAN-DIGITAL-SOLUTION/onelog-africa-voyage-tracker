import { render, screen } from '@testing-library/react'
import GoogleMap from './GoogleMap'

// Mock the MarkerClusterer to avoid errors
jest.mock('@googlemaps/markerclusterer', () => ({
  MarkerClusterer: jest.fn().mockImplementation(() => ({
    addMarker: jest.fn(),
    clearMarkers: jest.fn()
  }))
}))

describe('GoogleMap component', () => {
  it('renders without crashing', () => {
    render(
      <GoogleMap
        apiKey="test-key"
        markers={[]}
      />
    )
    expect(screen.getByTestId('google-map')).toBeInTheDocument()
  })
})
