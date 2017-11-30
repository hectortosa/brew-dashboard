import React, {Component} from 'react';

class UserPreferences extends Component {
    render() {
        return (
            <div>
                <h2>Preferences</h2>
                <form>
                    Max Threshold: <input type="text" value={this.props.value.maxThreshold} onChange={this.props.onChange} name="maxThreshold" />
                    Min Threshold: <input type="text" value={this.props.value.minThreshold} onChange={this.props.onChange} name="minThreshold" />
                </form>
                <button onClick={this.props.onSave}>Save preferences</button>
            </div>
        );
    }
}

export default UserPreferences;