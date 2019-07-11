/**
 * Project - RNProjectPlayground
 * Author      : ljunb
 * Date        : 2018/1/23 上午9:48
 * Description : Path 动画菜单效果
 */
import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import PropTypes, { element } from 'prop-types';

const MenuItemWH = 30;
const SwitchBtnWH = 40;
const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBtn: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    height: SwitchBtnWH,
    width: SwitchBtnWH,
    borderRadius: SwitchBtnWH / 2,
  },
  item: {
    height: MenuItemWH,
    width: MenuItemWH,
    borderRadius: MenuItemWH / 2,
    backgroundColor: 'red',
    position: 'absolute',
  },
  itemText: {
    backgroundColor: 'transparent',
    color: '#fff',
  },
  menuBtn: {
    height: MenuItemWH,
    width: MenuItemWH,
    borderRadius: MenuItemWH / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class PathMenuAnimation extends Component {
  static propTypes = {
    icons: PropTypes.array,
    radius: PropTypes.number,
    itemWidth: PropTypes.number,
    switchButtonWidth: PropTypes.number,
    animationScale: PropTypes.number,
    onSelect: PropTypes.func,
  };

  static defaultProps = {
    icons: [0, 1, 2, 3, 4],
    radius: 120,
    itemWidth: 30,
    switchButtonWidth: 40,
    animationScale: 1.5,
  };

  animatedValue = new Animated.Value(0);
  clickedValue = new Animated.Value(0);
  isFold = true;
  state = {
    origin: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    clickMenu: null,
  };

  handleShowOrHideMenu = () => {
    this.actionBtn && this.actionBtn.measure((ox, oy, width, height, px, py) => {
      this.setState({
        origin: {
          width, height, x: px, y: py,
        },
      }, () => {
        if (this.isFold) {
          this.spreadMenus();
        } else {
          this.foldMenus();
        }
      });
    });
  };

  /**
   * 展开菜单
   */
  spreadMenus = () => {
    Animated.spring(this.animatedValue, {
      toValue: 1,
      duration: 200,
      friction: 5,
    }).start(() => this.isFold = false);
  };

  /**
   * 折叠菜单
   */
  foldMenus = () => {
    Animated.sequence([
      Animated.timing(this.animatedValue, {
        toValue: 1.3,
        duration: 150,
      }),
      Animated.timing(this.animatedValue, {
        toValue: 0,
        duration: 300,
      }),
    ]).start(() => this.isFold = true);
  };

  hanldePressItem = index => {
    this.setState({ clickMenu: index }, () => {
      Animated.parallel([
        Animated.timing(this.clickedValue, {
          toValue: 1,
          duration: 450,
        }),
        Animated.sequence([
          Animated.timing(this.animatedValue, {
            toValue: 1.3,
            duration: 150,
          }),
          Animated.timing(this.animatedValue, {
            toValue: 0,
            duration: 300,
          }),
        ]),
      ]).start(() => {
        this.props.onSelect && this.props.onSelect(index);
        this.resetToDefaultConfig();
      });
    });
  };

  resetToDefaultConfig = () => {
    this.isFold = true;
    this.setState({ clickMenu: null }, () => this.clickedValue.setValue(0));
  };

  get buildAnimatedValues() {
    const { icons, itemWidth, radius } = this.props;
    // 每个按钮之间的间距角度
    const marginAngle = Math.PI / 180 * itemWidth;
    const restAngle = (Math.PI / 180 * 180 - (icons.length - 1) * itemWidth * Math.PI / 180) / 2;
    return icons.map((icon, index) => {
      const top = -radius * Math.sin(restAngle + index * marginAngle);
      const left = radius * Math.cos(restAngle + index * marginAngle);
      return { top, left };
    });
  }

  render() {
    const { itemWidth, switchButtonWidth, animationScale } = this.props;
    const { origin } = this.state;

    const rotate = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '-90deg'],
    });
    const originCenter = {
      x: origin.x + origin.width / 2,
      y: origin.y + origin.height / 2,
    };

    return (
      <View style={styles.root}>
        {this.props.icons.map((icon, index) => {
          const animatedItem = this.buildAnimatedValues[index];
          const isClicked = this.state.clickMenu === index;

          let top = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [origin.y + (switchButtonWidth - itemWidth) / 2, originCenter.y + animatedItem.top],
          });
          let left = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [origin.x + (switchButtonWidth - itemWidth) / 2, originCenter.x - animatedItem.left - itemWidth / 2],
          });
          let rotate = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '3600deg'],
          });
          let scale = this.animatedValue.interpolate({
            inputRange: [0, 0.2, 1],
            outputRange: [0, 0.5, 1],
            extrapolateRight: 'clamp',
          });

          if (isClicked) {
            top = originCenter.y + animatedItem.top;
            left = originCenter.x - animatedItem.left - itemWidth / 2;
            rotate = '0deg';
            scale = this.clickedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, animationScale],
            });
          }

          return (
            <Animated.View
              key={`Item_${index}`}
              style={[styles.item, { top, left, transform: [{ rotate }, { scale }] }]}
            >
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => this.hanldePressItem(index)}
                style={styles.menuBtn}
              >
                <Text style={styles.itemText}>{index}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
        <TouchableOpacity
          ref={r => this.actionBtn = r}
          activeOpacity={1}
          style={styles.centerBtn}
          onPress={this.handleShowOrHideMenu}
        >
          <Animated.Text style={[{ color: '#fff' }, { transform: [{ rotate }] }]}>＋</Animated.Text>
        </TouchableOpacity>
      </View>
    );
  }
}