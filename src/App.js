import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { credentials } from './secrets.js';
import { Component } from 'react';
import { render } from '@testing-library/react';

const info = credentials();

// Beatles : 3WrFJ7ztbogyGnTHbHJFl2

class App extends Component {
  constructor() {
    super();
    this.state = {
      haveToken: false,
      active: false,
      name: '',
      image: '',
      artistList: [],
    };
    this.auth = this.auth.bind(this);
    this.searchArtistName = this.searchArtistName.bind(this);
    this.selectArtist = this.selectArtist.bind(this);
  }
  async auth() {
    try {
      console.log('auth function triggered!');
      const authentication = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization:
              'Basic ' + btoa(info.clientId + ':' + info.clientSecret),
          },
        }
      );
      console.log('auth obj --->', authentication);
      localStorage.setItem('token', authentication.data.access_token);
      this.setState({ haveToken: true });
    } catch (error) {
      console.error(error);
    }
  }
  async selectArtist(e, id) {
    try {
      e.preventDefault();
      console.log('id arg --->', id);

      const artistData = await axios.get(
        `https://api.spotify.com/v1/artists/${id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Artist Data --->', artistData);
      let imageUrl = '';
      artistData.data.images.length
        ? (imageUrl = artistData.data.images[0].url)
        : (imageUrl =
            'https://i.pinimg.com/originals/7a/ec/a5/7aeca525afa2209807c15da821b2f2c6.png');
      this.setState({
        active: true,
        name: artistData.data.name,
        image: imageUrl,
        artistList: [],
      });
      document.getElementById('searchBar').reset();
    } catch (error) {
      console.error(error);
    }
  }
  async searchArtistName(name) {
    try {
      name.preventDefault();
      const results = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: {
          q: name.target.artistName.value,
          type: 'artist',
        },
      });
      console.log('artist list', results);
      this.setState({
        active: false,
        name: '',
        image: '',
        artistList: results.data.artists.items,
      });
      name.target.reset();
    } catch (error) {
      console.error(error);
    }
  }
  render() {
    return (
      <div className="App">
        <div className="flex column alignCenter">
          <h1>4More</h1>
          <p>A place to discover new artists</p>
          {localStorage.getItem('token') ? (
            <div>
              <h2 style={{ marginTop: '50px' }}>Search an Artist Name</h2>
              <form onSubmit={(e) => this.searchArtistName(e)} id="searchBar">
                <input placeholder="Artist Name" name="artistName" />
                <button type="submit">Search</button>
              </form>
            </div>
          ) : (
            <button type="button" onClick={this.auth}>
              Log in via Spotify
            </button>
          )}
          {this.state.active && (
            <div className="flex column alignCenter">
              <h1 style={{ margin: '25px', maxWidth: '640px' }}>
                {this.state.name}
              </h1>
              <img
                src={this.state.image}
                alt="artist"
                style={{ width: '640px', height: '640px' }}
              />
            </div>
          )}
          {this.state.artistList.length > 0 &&
            this.state.artistList.map((artist) => (
              <div key={artist.id} className="artistListResult">
                <h6
                  style={{
                    margin: '0px 0px 25px 0px',
                    maxWidth: '150px',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => this.selectArtist(e, artist.id)}
                >
                  {artist.name}
                </h6>
                {artist.images.length > 0 ? (
                  <img
                    src={artist.images[2].url}
                    style={{
                      height: '150px',
                      width: '150px',
                      cursor: 'pointer',
                    }}
                    alt="artist"
                    onClick={(e) => this.selectArtist(e, artist.id)}
                  />
                ) : (
                  <img
                    src="https://i.pinimg.com/originals/7a/ec/a5/7aeca525afa2209807c15da821b2f2c6.png"
                    alt="Artist"
                    style={{
                      height: '150px',
                      width: '150px',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => this.selectArtist(e, artist.id)}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default App;
