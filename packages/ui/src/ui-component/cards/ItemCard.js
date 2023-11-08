import PropTypes from 'prop-types'

// material-ui
import { styled } from '@mui/material/styles'
import { Stack, Typography } from '@mui/material'

// project imports
import MainCard from 'ui-component/cards/MainCard'
import SkeletonChatflowCard from 'ui-component/cards/Skeleton/ChatflowCard'

// --------------------------------------

import Paper from '@mui/material/Paper'
// import { styled } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
// import CardActions from '@mui/material/CardActions'
// import Collapse from '@mui/material/Collapse'
import Avatar from '@mui/material/Avatar'
// import Typography from '@mui/material/Typography'
// import FavoriteIcon from '@mui/icons-material/Favorite'
// import ShareIcon from '@mui/icons-material/Share'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// --------------------------------------

const CardWrapper = styled(MainCard)(({ theme }) => ({
    background: /* theme.palette.card.main */ '#212B46',
    color: theme.darkTextPrimary,
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
    cursor: 'pointer',
    '&:hover': {
        background: theme.palette.card.hover,
        boxShadow: '0 2px 14px 0 rgb(32 40 45 / 20%)'
    },
    maxHeight: '300px',
    maxWidth: '300px',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-line'
}))

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'justify',
    color: theme.palette.text.secondary
    // maxWidth: 400
}))

// ===========================|| CONTRACT CARD ||=========================== //

const ItemCard = ({ isLoading, data, images, onClick }) => {
    /*  return (
        <>
            {isLoading ? (
                <SkeletonChatflowCard />
            ) : (
                <CardWrapper border={false} content={false} onClick={onClick}>
                    <Box sx={{ p: 2.25 }}>
                        <Grid container direction='column'>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                {data.iconSrc && (
                                    <div
                                        style={{
                                            width: 35,
                                            height: 35,
                                            marginRight: 10,
                                            borderRadius: '50%',
                                            background: `url(${data.iconSrc})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center center'
                                        }}
                                    ></div>
                                )}
                                {!data.iconSrc && data.color && (
                                    <div
                                        style={{
                                            width: 35,
                                            height: 35,
                                            marginRight: 10,
                                            borderRadius: '50%',
                                            background: data.color
                                        }}
                                    ></div>
                                )}
                                <Typography sx={{ fontSize: '1rem', fontWeight: 500, overflowWrap: 'break-word', whiteSpace: 'pre-line' }}
                                >
                                    {data.templateName || data.name}
                                </Typography>
                            </div>
                            {data.description && (
                                <span style={{ marginTop: 10, overflowWrap: 'break-word', whiteSpace: 'pre-line' }}>
                                    {data.description}
                                </span>
                            )}
                            {images && (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        marginTop: 5
                                    }}
                                >
                                    {{images.map((img) => (
                                        <div
                                            key={img}
                                            style={{
                                                width: 35,
                                                height: 35,
                                                marginRight: 5,
                                                borderRadius: '50%',
                                                backgroundColor: 'white',
                                                marginTop: 5
                                            }}
                                        >
                                            <img
                                                style={{ width: '100%', height: '100%', padding: 5, objectFit: 'contain' }}
                                                alt=''
                                                src={img}
                                            />
                                        </div>
                                    ))}}
                                </div>
                            )}
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    ) */

    return (
        <>
            {isLoading ? (
                <SkeletonChatflowCard />
            ) : (
                <Card
                    /* sx={{ maxWidth: 345 }} */ sx={{
                        background: /* theme.palette.card.main */ '#212B46',
                        color: /* theme.darkTextPrimary */ 'white',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                        cursor: 'pointer',
                        '&:hover': {
                            background: /* theme.palette.card.hover */ '#161d2f',
                            boxShadow: '0 2px 14px 0 rgb(32 40 45 / 20%)'
                        },
                        // maxHeight: '300px',
                        // maxWidth: '300px',
                        height: '225px'
                        // overflowWrap: 'break-word',
                        // whiteSpace: 'pre-line'
                    }}
                    border={false}
                    content={false}
                    onClick={onClick}
                >
                    {/*  <CardHeader
                        title={
                            <Typography gutterBottom variant='h2' component='div'>
                                {data.templateName || data.name}
                            </Typography>
                        }
                        avatar={
                            <Avatar sx={{ bgcolor: '#b0d236', color: 'black', fontSize: '2rem' }} aria-label='name'>
                                {Array.from(data.template || data.name)[0].toUpperCase()}
                            </Avatar>
                        }
                        subheader=''
                    /> */}
                    <CardContent>
                        <Stack spacing={1} direction='row' alignItems='left' sx={{ mb: '10px' }}>
                            <Avatar sx={{ bgcolor: '#b0d236', color: 'black', fontSize: '1.5rem', fontWeight: '700' }} aria-label='name'>
                                {Array.from(data.template || data.name)[0].toUpperCase()}
                            </Avatar>
                            <Typography variant='h2' noWrap>
                                {data.templateName || data.name}
                            </Typography>
                        </Stack>
                        <Typography variant='body' color='text.secondary' textAlign={'justify'}>
                            {data.description ||
                                `Lorem ipsum odor amet, consectetuer adipiscing elit. Imperdiet erat nullam tortor quis elit lacusblandit vitae. Nostra dapibus bibendum; commodo metus vestibulum tristique. Tristique volutpat consectetur congue lorem pharetra habitant.`
                                    .split('')
                                    .sort(function () {
                                        return 0.5 - Math.random()
                                    })
                                    .join('')}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </>
    )
}

ItemCard.propTypes = {
    isLoading: PropTypes.bool,
    data: PropTypes.object,
    images: PropTypes.array,
    onClick: PropTypes.func
}

export default ItemCard
