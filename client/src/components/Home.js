import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { SidebarContainer } from "./Sidebar";
import { ActiveChat } from "./ActiveChat";
import { logout, fetchConversations } from "../store/utils/thunkCreators";
import { clearOnLogout } from "../store/index";

const styles = {
  root: {
    height: "97vh",
  },
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.user.id !== prevProps.user.id) {
      this.setState({
        isLoggedIn: true,
      });
    }
  }

  componentDidMount() {
    // check localstorage so counts will persist upon refresh
    const storage = localStorage.getItem("unreadCounts");
    const unreadCounts = storage ?? {};

    this.props.fetchConversations()
      .then(res => {
        if (!storage) {
          res.conversations.forEach(convo => {
          unreadCounts[convo.id] = convo.unread;
          });
          localStorage.setItem("unreadCounts", JSON.stringify(unreadCounts));
        }
      });
  }

  getLastRead = (conversationId) => {
    let lastRead;
    this.props.conversations.forEach(convo => {
      if (convo.id === conversationId) lastRead = convo.lastRead;
    })
    return lastRead
  }

  handleLogout = async () => {
    const unreadCounts = JSON.parse(localStorage.getItem("unreadCounts"));
    const conversationId = JSON.parse(localStorage.getItem("active-convo"));
    const lastRead = conversationId && this.getLastRead(conversationId)
    const logoutParameters = { id: this.props.user.id, unreadCounts, lastRead, conversationId }
    await this.props.logout(logoutParameters);
  };

  render() {
    const { classes } = this.props;
    if (!this.props.user.id) {
      // If we were previously logged in, redirect to login instead of register
      if (this.state.isLoggedIn) return <Redirect to="/login" />;
      return <Redirect to="/register" />;
    }
    return (
      <>
        {/* logout button will eventually be in a dropdown next to username */}
        <Button className={classes.logout} onClick={this.handleLogout}>
          Logout
        </Button>
        <Grid container component="main" className={classes.root}>
          <CssBaseline />
          <SidebarContainer />
          <ActiveChat />
        </Grid>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    conversations: state.conversations,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: (params) => {
      dispatch(logout(params));
      dispatch(clearOnLogout());
    },
    fetchConversations: () => {
      return dispatch(fetchConversations());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Home));
